import * as d3 from 'd3';
import { binarySearchLastIndexBefore } from '../../parser/util/binary-search';
import { formatTimeMs } from '../util';

type WorkerPoint = { ms: number; y0: number; y1: number };
type WorkerSeries = { color: string; points: WorkerPoint[] };

type InitMessage = { type: 'init'; canvas: OffscreenCanvas };
type ResizeMessage = {
	type: 'resize';
	pixelWidth: number;
	pixelHeight: number;
};
type SetDataMessage = {
	type: 'setData';
	series: WorkerSeries[];
	yAxisLabel: string;
	minimalMaximumY: number;
};
type SetViewMessage = {
	type: 'setFrame';
	timeBoundsAnimated: readonly [number, number];
	timeBoundsTarget: readonly [number, number];
	axisColor: string;
};

type WorkerMessage = InitMessage | ResizeMessage | SetDataMessage | SetViewMessage;

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

let pixelWidth = 400;
let pixelHeight = 300;

let series: WorkerSeries[] = [];
let allPoints: WorkerPoint[] = [];
let timeBoundsAnimated: readonly [number, number] = [0, 1];
let timeBoundsTarget: readonly [number, number] = [0, 1];
let axisColor = '#000';
let yAxisLabel = '';
let minimalMaximumY = 0;
let drawQueued = false;
let drawTimerId: ReturnType<typeof setTimeout> | null = null;
let drawDelayMs = 0;
let animatedMaxY: number | null = null;
let lastDrawTimeMs: number | null = null;

const widthWithMargin = 400;
const heightWithMargin = 300;
const marginTop = 25;
const marginRight = 10;
const marginBottom = 35;
const marginLeft = 45;
const height = heightWithMargin - marginTop - marginBottom;
const width = widthWithMargin - marginLeft - marginRight;
const targetFps = 60;
const frameDurationMs = 1000 / targetFps;
const maxDtForYAnimationMs = frameDurationMs * 2;
const yAnimationDurationMs = 50;
const ySnapEpsilon = 0.05;
const maxSamplesPerPixel = 2;

function getVisibleIndexRange(points: WorkerPoint[], minMs: number, maxMs: number): readonly [number, number] {
	if (points.length === 0) return [0, -1] as const;

	const startBefore = binarySearchLastIndexBefore(points, minMs, (p) => p.ms);
	const endBefore = binarySearchLastIndexBefore(points, maxMs, (p) => p.ms);

	const start = Math.max(0, startBefore - 1);
	const end = Math.min(points.length - 1, Math.max(endBefore + 1, 0));

	return start <= end ? ([start, end] as const) : ([0, -1] as const);
}

function iterateRange(points: WorkerPoint[], startIdx: number, endIdx: number): Iterable<WorkerPoint> {
	return {
		*[Symbol.iterator]() {
			for (let i = startIdx; i <= endIdx; i++) {
				yield points[i]!;
			}
		},
	};
}

function iterateDecimatedRangeByMs(
	points: WorkerPoint[],
	startIdx: number,
	endIdx: number,
	bucketAnchorMs: number,
	minMs: number,
	maxMs: number,
	maxPoints: number,
): Iterable<WorkerPoint> {
	if (endIdx < startIdx) {
		return iterateRange(points, 0, -1);
	}

	const totalVisible = endIdx - startIdx + 1;
	if (totalVisible <= maxPoints) {
		return iterateRange(points, startIdx, endIdx);
	}

	const safeDomainMax = maxMs > minMs ? maxMs : minMs + 1;
	const bucketCount = Math.max(1, Math.floor(maxPoints / 2));
	const bucketMs = (safeDomainMax - minMs) / bucketCount;
	if (!Number.isFinite(bucketMs) || bucketMs <= 0) {
		return iterateRange(points, startIdx, endIdx);
	}

	const getBucketIndex = (ms: number) => {
		return Math.floor((ms - bucketAnchorMs) / bucketMs);
	};

	return {
		*[Symbol.iterator]() {
			let index = startIdx;
			while (index <= endIdx) {
				const firstIdx = index;
				const bucket = getBucketIndex(points[index]!.ms);
				let lastIdx = index;
				index++;

				while (index <= endIdx && getBucketIndex(points[index]!.ms) === bucket) {
					lastIdx = index;
					index++;
				}

				yield points[firstIdx]!;
				if (lastIdx !== firstIdx) {
					yield points[lastIdx]!;
				}
			}
		},
	};
}

function drawXAxis(ctx: OffscreenCanvasRenderingContext2D, xScale: d3.ScaleLinear<number, number>, axisColor: string) {
	ctx.save();
	ctx.translate(marginLeft, marginTop + height);

	ctx.strokeStyle = axisColor;
	ctx.fillStyle = axisColor;
	ctx.lineWidth = 1;
	ctx.font = '9px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(width, 0);
	ctx.stroke();

	const ticks = xScale.ticks(6);
	for (const tick of ticks) {
		const xPos = xScale(tick);
		ctx.beginPath();
		ctx.moveTo(xPos, 0);
		ctx.lineTo(xPos, 6);
		ctx.stroke();
		ctx.fillText(formatTimeMs(tick), xPos, 9);
	}

	ctx.restore();
}

function drawYAxis(ctx: OffscreenCanvasRenderingContext2D, yScale: d3.ScaleLinear<number, number>, axisColor: string) {
	ctx.save();
	ctx.translate(marginLeft, marginTop);

	ctx.strokeStyle = axisColor;
	ctx.fillStyle = axisColor;
	ctx.lineWidth = 1;
	ctx.font = '9px sans-serif';
	ctx.textAlign = 'end';
	ctx.textBaseline = 'middle';

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, height);
	ctx.stroke();

	const ticks = yScale.ticks(6);
	for (const tick of ticks) {
		const yPos = yScale(tick);
		ctx.beginPath();
		ctx.moveTo(0, yPos);
		ctx.lineTo(-6, yPos);
		ctx.stroke();
		ctx.fillText(tick.toString(), -9, yPos);
	}

	ctx.restore();
}

function draw(nowMs: number) {
	if (!ctx) return;
	if (series.length === 0) {
		animatedMaxY = null;
		lastDrawTimeMs = nowMs;
		return;
	}

	const sx = pixelWidth / widthWithMargin;
	const sy = pixelHeight / heightWithMargin;
	ctx.setTransform(sx, 0, 0, sy, 0, 0);
	ctx.clearRect(0, 0, widthWithMargin, heightWithMargin);

	ctx.fillStyle = axisColor;
	ctx.font = '10px sans-serif';
	ctx.textAlign = 'end';
	ctx.fillText(yAxisLabel, marginLeft - 4, 14);

	ctx.textAlign = 'center';
	ctx.fillText('Time', widthWithMargin / 2, heightWithMargin - 2);

	const frameMin = allPoints.length > 0 ? allPoints[0]!.ms : 0;
	const frameMax = allPoints.length > 0 ? allPoints[allPoints.length - 1]!.ms : 1;

	const xRender = d3.scaleLinear().domain(timeBoundsAnimated).range([0, width]);
	const xNotAnimated = d3.scaleLinear().domain([frameMin, frameMax]).range([0, width]);

	const topSeries = series.at(-1);
	const [targetStartIdx, targetEndIdx] = topSeries
		? getVisibleIndexRange(topSeries.points, timeBoundsTarget[0], timeBoundsTarget[1])
		: ([0, -1] as const);

	let maxInSelection = 0;
	if (topSeries && targetEndIdx >= targetStartIdx) {
		for (let i = targetStartIdx; i <= targetEndIdx; i++) {
			const point = topSeries.points[i]!;
			if (point.y1 > maxInSelection) {
				maxInSelection = point.y1;
			}
		}
	}

	const targetMaxY = Math.max(maxInSelection * 1.05, minimalMaximumY);
	if (animatedMaxY == null || !Number.isFinite(animatedMaxY)) {
		animatedMaxY = targetMaxY;
	}

	const dtRaw = lastDrawTimeMs == null ? frameDurationMs : nowMs - lastDrawTimeMs;
	const dt = Math.min(Math.max(1, dtRaw), maxDtForYAnimationMs);
	const alpha = 1 - Math.exp(-dt / yAnimationDurationMs);
	const interpolatedMaxY = animatedMaxY + (targetMaxY - animatedMaxY) * alpha;
	const didNotMove = interpolatedMaxY === animatedMaxY;
	const shouldSnap =
		didNotMove || !Number.isFinite(interpolatedMaxY) || Math.abs(targetMaxY - interpolatedMaxY) <= ySnapEpsilon;
	animatedMaxY = shouldSnap ? targetMaxY : interpolatedMaxY;

	const yScale = d3.scaleLinear().domain([0, animatedMaxY]).rangeRound([height, 0]);

	ctx.save();
	ctx.translate(marginLeft, marginTop);
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.clip();

	const frameMinX = xRender(frameMin);
	const frameMaxX = xRender(frameMax);
	const scaleX = (frameMaxX - frameMinX) / width;

	ctx.save();
	ctx.translate(frameMinX, 0);
	ctx.scale(scaleX, 1);

	const visiblePlotPixelWidth = Math.max(1, (pixelWidth * width) / widthWithMargin);
	const maxVisiblePoints = Math.max(8, Math.floor(visiblePlotPixelWidth * maxSamplesPerPixel));

	for (const stackedSeries of series) {
		const [seriesVisibleStartIdx, seriesVisibleEndIdx] = getVisibleIndexRange(
			stackedSeries.points,
			timeBoundsAnimated[0],
			timeBoundsAnimated[1],
		);
		if (seriesVisibleEndIdx < seriesVisibleStartIdx) continue;
		if (stackedSeries.points.length === 0) continue;
		const visiblePoints = iterateDecimatedRangeByMs(
			stackedSeries.points,
			seriesVisibleStartIdx,
			seriesVisibleEndIdx,
			frameMin,
			timeBoundsAnimated[0],
			timeBoundsAnimated[1],
			maxVisiblePoints,
		);

		ctx.fillStyle = stackedSeries.color;
		ctx.beginPath();
		const d3Ctx = ctx as unknown as CanvasRenderingContext2D;
		d3
			.area<WorkerPoint>()
			.x((d) => xNotAnimated(d.ms))
			.y0((d) => yScale(d.y0))
			.y1((d) => yScale(d.y1))
			.curve(d3.curveStepAfter)
			.context(d3Ctx)(visiblePoints);
		ctx.closePath();
		ctx.fill();
	}

	ctx.restore();

	ctx.restore();

	drawXAxis(ctx, xRender, axisColor);
	drawYAxis(ctx, yScale, axisColor);

	lastDrawTimeMs = nowMs;
	if (!Number.isFinite(targetMaxY) || !Number.isFinite(animatedMaxY)) return;
	if (Math.abs(targetMaxY - animatedMaxY) > ySnapEpsilon) {
		scheduleDraw(frameDurationMs);
	}
}

function scheduleDraw(delayMs = 0) {
	if (drawQueued) {
		if (delayMs < drawDelayMs && drawTimerId != null) {
			clearTimeout(drawTimerId);
			drawDelayMs = delayMs;
			drawTimerId = setTimeout(() => {
				drawQueued = false;
				drawTimerId = null;
				drawDelayMs = 0;
				draw(performance.now());
			}, delayMs);
		}
		return;
	}

	drawQueued = true;
	drawDelayMs = delayMs;
	drawTimerId = setTimeout(() => {
		drawQueued = false;
		drawTimerId = null;
		drawDelayMs = 0;
		draw(performance.now());
	}, delayMs);
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
	const message = event.data;
	if (message.type === 'init') {
		canvas = message.canvas;
		ctx = canvas.getContext('2d');
		return;
	}
	if (message.type === 'resize') {
		pixelWidth = message.pixelWidth;
		pixelHeight = message.pixelHeight;
		if (canvas) {
			canvas.width = pixelWidth;
			canvas.height = pixelHeight;
		}
		scheduleDraw();
		return;
	}
	if (message.type === 'setData') {
		series = message.series;
		allPoints = series.flatMap((s) => s.points);
		yAxisLabel = message.yAxisLabel;
		minimalMaximumY = message.minimalMaximumY;
		scheduleDraw();
		return;
	}
	if (message.type === 'setFrame') {
		timeBoundsAnimated = message.timeBoundsAnimated;
		timeBoundsTarget = message.timeBoundsTarget;
		axisColor = message.axisColor;
		scheduleDraw();
		return;
	}
};
