import { type FrameEndEvent, type FrameEndEventNumberKey } from '../../parser';
import { animationStore, extraChartStore, gameplayStore, hoverMsStore, uiStore, useRoomDisplayStore } from '../store';
import * as d3 from 'd3';
import { type D3BrushEvent } from 'd3-brush';
import {
	type Component,
	For,
	type JSXElement,
	createEffect,
	createMemo,
	createUniqueId,
	untrack,
	Show,
	createSignal,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { downScale } from './down-scale';
import { createIsVisible } from './use-is-visible';
import { ColorClasses } from '../colors';
import { d3Ticks, formatTimeMs, isFilledD3Selection } from '../util';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { Checkbox } from '~/components/ui/checkbox';

export type LineChartVariableDescription = {
	key: FrameEndEventNumberKey;
	name: string;
	description: string;
	UnitIcon: Component<{ class?: string }>;
	order: number;
	color: ColorClasses;
} & (
	| {
			notShownInGraph: true;
	  }
	| {
			defaultHidden?: true;
	  }
);

export type LineChartShownVariableDescription = Exclude<LineChartVariableDescription, { notShownInGraph: true }>;

function isShownInGraph(it: LineChartVariableDescription): it is LineChartShownVariableDescription {
	return !('notShownInGraph' in it && it.notShownInGraph === true);
}

export interface LineAreaChartProps {
	variables: LineChartVariableDescription[];
	yAxisLabel: string;
	header: JSXElement;
	minimalMaximumY: number;
	downScaleMaxTimeDelta: number;
	renderScale?: number;
}

export const LineAreaChart: Component<LineAreaChartProps> = (props) => {
	const roomDisplayStore = useRoomDisplayStore();
	const renderScale = () => props.renderScale ?? 10;

	const variablesPerKey = createMemo(() => {
		return Object.fromEntries(props.variables.map((it) => [it.key, it] as const));
	});

	const [svgRef, setSvgRef] = createSignal<SVGSVGElement | null>(null);

	const isV1 = uiStore.isV1();

	const isVisible = createIsVisible(svgRef);

	let previousTimeBounds: readonly [number, number] = [0, 0];
	const debouncedTimeBounds = createMemo<readonly [number, number]>(() => {
		if (!isVisible()) return previousTimeBounds;
		const bounds = extraChartStore.debouncedTimeBounds();
		previousTimeBounds = bounds;
		return bounds;
	});
	let previousMsIntoGame = 0;
	const debouncedMsIntoGame = createMemo<number>(() => {
		if (!isVisible()) return previousMsIntoGame;
		const ms = extraChartStore.debouncedMsIntoGame();
		previousMsIntoGame = ms;
		return ms;
	});

	const [selectedVars, setSelectedVars] = createSignal<FrameEndEventNumberKey[]>(
		// eslint-disable-next-line solid/reactivity
		props.variables
			.filter(isShownInGraph)
			.filter((it) => !it.defaultHidden)
			.sort((a, b) => a.order - b.order)
			.map((it) => it.key),
	);

	function onVariableCheckedChange(key: FrameEndEventNumberKey, checked: boolean) {
		const prev = selectedVars();
		const _variablesPerKey = variablesPerKey();
		if (checked) {
			setSelectedVars([...prev, key].sort((a, b) => _variablesPerKey[a]!.order - _variablesPerKey[b]!.order));
		} else {
			setSelectedVars(prev.filter((it) => it !== key));
		}
	}

	const id = createUniqueId();

	const data = createMemo(() => {
		const recording = gameplayStore.recording();
		if (!recording) return [];
		const togetherEvents = downScale(
			recording.frameEndEvents,
			props.variables.map((it) => it.key),
			props.downScaleMaxTimeDelta,
		);
		return togetherEvents;
	});

	type Datum = FrameEndEvent;
	type Series = {
		data: Datum;
		0: number;
		1: number;
	}[] & { key: string; index: number };

	const widthWithMargin = () => 400 * renderScale();
	const heightWithMargin = () => 300 * renderScale();
	const marginTop = () => 25 * renderScale();
	const marginRight = () => 10 * renderScale();
	const marginBottom = () => 35 * renderScale();
	const marginLeft = () => 45 * renderScale();
	const height = () => heightWithMargin() - marginTop() - marginBottom();
	const width = () => widthWithMargin() - marginLeft() - marginRight();

	// Determine the series that need to be stacked.
	const series = createMemo(() => {
		const _data = data();
		const _selectedVars = selectedVars();
		return d3.stack<Datum>().keys(
			_selectedVars.length === 0
				? props.variables
						.filter(isShownInGraph)
						.sort((a, b) => a.order - b.order)
						.map((it) => it.key)
				: _selectedVars,
		)(_data) as unknown as Series[];
	});

	const x = createMemo(() => {
		return d3.scaleLinear().domain(debouncedTimeBounds()).range([0, width()]);
	});

	const xNotAnimated = createMemo(() => {
		return d3
			.scaleLinear()
			.domain([gameplayStore.timeFrame().min, gameplayStore.timeFrame().max])
			.range([0, width()]);
	});

	const maxYOverAllTime = createMemo(() => {
		return Math.max(d3.max(series().at(-1)!, (d) => d[1]) ?? props.minimalMaximumY, props.minimalMaximumY);
	});

	// todo sub to series
	const maxYInSelection = createMemo(() => {
		if (isV1) return maxYOverAllTime();
		const _series = series();
		const _debouncedTimeBounds = debouncedTimeBounds();
		const s = _series.at(-1)!;
		const minMsIntoGame = _debouncedTimeBounds[0];
		const maxMsIntoGame = _debouncedTimeBounds[1];
		const max =
			d3.max(s, (d, i) => {
				const dMsIntoGame = d.data.msIntoGame;
				const dNextMsIntoGame = s[i + 1]?.data.msIntoGame ?? dMsIntoGame;
				function isInRange(msIntoGame: number | null) {
					if (msIntoGame == null) return false;
					return msIntoGame >= minMsIntoGame && msIntoGame <= maxMsIntoGame;
				}
				const isInRangeOrClose =
					isInRange(dMsIntoGame) ||
					(dMsIntoGame < minMsIntoGame && (dNextMsIntoGame > maxMsIntoGame || i === s.length - 1));

				return isInRangeOrClose ? d[1] : 0;
			}) ?? 0;
		return Math.max(max * 1.05, props.minimalMaximumY);
	});

	const y = createMemo(() => {
		return d3
			.scaleLinear()
			.domain([0, maxYOverAllTime()] as [number, number])
			.rangeRound([height(), 0]);
	});

	const yInSelection = createMemo(() => {
		return d3
			.scaleLinear()
			.domain([0, maxYInSelection()] as [number, number])
			.rangeRound([height(), 0]);
	});

	let skipNextUpdate = false;
	const onBrushEnd = (didHoldAction: boolean, event: D3BrushEvent<unknown>) => {
		const selection = (event.selection ?? null) as [number, number] | null;

		if (skipNextUpdate) {
			skipNextUpdate = false;
			return;
		}

		if (selection == null) {
			if (!didHoldAction) {
				extraChartStore.resetTimeBounds();
			}
		} else {
			const invSelection = [x().invert(selection[0]), x().invert(selection[1])] as const;
			extraChartStore.setTimeBoundsStopFollowIfOutside(invSelection);
		}
		// todo animate axis
		skipNextUpdate = true;
		svgParts().brush!.move(svgParts().brushG!, null);
	};

	const svgParts = createMemo(function lineAreaChartMainSetup() {
		const _recording = gameplayStore.recording();
		if (!_recording) {
			return {
				areaPaths: null,
				xAxis: null,
				yAxis: null,
				brush: null,
				brushG: null,
				animationLine: null,
			};
		}
		const svg = d3.select(svgRef());

		svg.selectAll('*').remove();

		svg.append('text')
			.attr('x', marginLeft() - 10 * renderScale())
			.attr('y', 14 * renderScale())
			.attr('text-anchor', 'end')
			.attr('class', 'text-foreground fill-current')
			.attr('font-size', 10 * renderScale())
			.text(props.yAxisLabel);

		// Append the horizontal axis atop the area.
		svg.append('text')
			.attr('x', widthWithMargin() / 2)
			.attr('y', heightWithMargin() - 2 * renderScale())
			.attr('text-anchor', 'middle')
			.attr('class', 'text-foreground fill-current')
			.attr('font-size', 10 * renderScale())
			.text('Time');

		// brush
		const rootG = svg.append('g').attr('transform', 'translate(' + marginLeft() + ',' + marginTop() + ')');
		rootG
			.append('defs')
			.append('svg:clipPath')
			.attr('id', id + 'clip')
			.append('svg:rect')
			.attr('width', width)
			.attr('height', height)
			.attr('x', 0)
			.attr('y', 0);

		const _variablesPerKey = variablesPerKey();
		const areaPaths = rootG
			.append('g')
			.attr('clip-path', `url(#${id}clip)`)
			.selectAll()
			.data(series())
			.join('path')
			.attr('transform-origin', '0 80%')
			.attr('class', (d) => _variablesPerKey[d.key]?.color?.path ?? '');
		areaPaths.append('title').text((d) => d.key);

		// axis x
		const xAxis = rootG.append('g').attr('transform', `translate(0,${height()})`);

		// axis y
		const yAxis = rootG.append('g');

		function mouseToMsIntoGame(e: MouseEvent) {
			return untrack(() => {
				const extraChartsTimeBounds = extraChartStore.timeBounds();
				const rect = brushG.node()!.getBoundingClientRect();
				const x = e.clientX - rect.left;
				return Math.round(
					extraChartsTimeBounds[0] + (extraChartsTimeBounds[1] - extraChartsTimeBounds[0]) * (x / rect.width),
				);
			});
		}
		function sceneFromMs(ms: number) {
			if (!_recording) return null;
			return _recording.sceneEventFromMs(ms);
		}

		let didHoldAction = false;
		let holdTimeout: number | null = null;
		let holdStartMousePosition = { x: 0, y: 0 };
		let currentMousePosition = { x: 0, y: 0 };
		function startHold(e: MouseEvent) {
			didHoldAction = false;
			cancelHold();
			holdStartMousePosition = { x: e.clientX, y: e.clientY };
			currentMousePosition = { x: e.clientX, y: e.clientY };
			holdTimeout = window.setTimeout(() => {
				holdTimeout = null;
				const distance = Math.sqrt(
					(currentMousePosition.x - holdStartMousePosition.x) ** 2 +
						(currentMousePosition.y - holdStartMousePosition.y) ** 2,
				);
				if (distance < 10) {
					moveToMsIntoGame(e);
					didHoldAction = true;
				}
			}, 500);
		}

		function cancelHold() {
			if (holdTimeout) {
				window.clearTimeout(holdTimeout);
				holdTimeout = null;
			}
		}

		function moveToMsIntoGame(e: MouseEvent) {
			const ms = mouseToMsIntoGame(e);
			animationStore.setMsIntoGame(ms);
			const scene = sceneFromMs(ms)?.getMainVirtualSceneName();
			if (scene) {
				roomDisplayStore.setSelectedSceneName(scene);
			}
		}

		// brush
		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width(), height()],
			])
			.filter((e) => {
				return !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
			})
			// eslint-disable-next-line solid/reactivity
			.on('end', (e) => {
				onBrushEnd(didHoldAction, e);
				cancelHold();
				didHoldAction = false;
			});
		const brushG = rootG
			.append('g')
			.attr('class', 'brush')
			.on('mousemove', (e) => {
				if (isV1) return;
				const ms = mouseToMsIntoGame(e);
				hoverMsStore.setHoveredMsIntoGame(ms);
				const scene = sceneFromMs(ms)?.getMainVirtualSceneName();
				if (scene) {
					roomDisplayStore.setHoveredRoom(scene);
					roomDisplayStore.setSelectedRoomIfNotPinned(scene);
				}
			})
			.on('pointermove', (e: PointerEvent) => {
				if (isV1) return;
				currentMousePosition = { x: e.clientX, y: e.clientY };

				e.preventDefault();
			})
			.on('mouseleave', () => {
				if (isV1) return;
				hoverMsStore.setHoveredMsIntoGame(null);
				roomDisplayStore.setHoveredRoom(null);
			})
			.on('pointerdown', (e) => {
				if (isV1) return;
				startHold(e);
			})
			.on('click', (e) => {
				if (isV1) return;
				cancelHold();
				if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
					moveToMsIntoGame(e);
					e.preventDefault();
				}
			});
		brushG.call(brush);

		// animationLine
		const animationLine = rootG
			.append('line')
			.attr('class', 'stroke-current text-foreground pointer-events-none')
			.attr('stroke-width', 2 * renderScale())
			.attr('stroke-dasharray', `${renderScale() * 3} ${renderScale() * 3}`)
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', height);

		return {
			areaPaths,
			xAxis,
			yAxis,
			brush,
			brushG,
			animationLine,
		};
	});

	// update area
	createEffect(function lineAreaChartUpdateAreaEffect() {
		const { areaPaths } = svgParts();
		if (!isFilledD3Selection(areaPaths)) return;
		const _y = y();
		const _xNotAnimated = xNotAnimated();

		// Construct an area shape.
		const area = d3
			.area<Series[number]>()
			.x((d) => {
				return _xNotAnimated(d.data?.msIntoGame ?? 0);
			})
			.y0((d) => _y(d[0]))
			.y1((d) => _y(d[1]))
			.curve(d3.curveStepAfter);

		// areaPaths().transition().ease(d3.easeLinear).duration(extraChartStore.transitionDuration).attr('d', area);
		areaPaths.attr('d', area);
		//areaPaths.current.attr('d', area);

		// areaPaths.current.attr('d', area);
		// }, [mainEffectChanges, recording, width, x, y]);
	});

	// update area movement
	createEffect(function lineAreaChartMoveAreaEffect() {
		const { areaPaths } = svgParts();
		if (!isFilledD3Selection(areaPaths)) return;
		const _x = x();

		const zeroX = _x(0);
		const maxX = _x(gameplayStore.timeFrame().max);

		const scaleX = Math.round(((maxX - zeroX) / width()) * 100) / 100;

		const scaleY = Math.round((maxYOverAllTime() / maxYInSelection()) * 100) / 100;

		const base =
			areaPaths.attr('data-existed') === 'true'
				? areaPaths.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear)
				: areaPaths;
		areaPaths.attr('data-existed', 'true');

		base.attr('transform', `translate(${zeroX} 0) scale(${scaleX} ${scaleY})`);
	});

	// update x axis
	createEffect(function lineAreaChartUpdateXAxisEffect() {
		const { xAxis } = svgParts();
		if (!isFilledD3Selection(xAxis)) return;
		const _x = x();
		xAxis.attr('font-size', renderScale() * 9).style('stroke-width', renderScale);
		const base = xAxis.selectAll('*').empty()
			? xAxis
			: xAxis.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear);
		d3Ticks(
			base.call(
				d3
					.axisBottom(_x)
					.tickSizeOuter(0)
					.ticks(6)
					.tickSize(6 * renderScale())
					.tickSizeInner(6 * renderScale())
					.tickSizeOuter(6 * renderScale())
					.tickPadding(3 * renderScale())
					.tickFormat((d) => formatTimeMs(d.valueOf())),
			),
		)
			.attr('font-size', renderScale() * 9)
			.style('stroke-width', renderScale());
	});

	// update y axis
	createEffect(function lineAreaChartUpdateYAxisEffect() {
		const { yAxis } = svgParts();
		if (!isFilledD3Selection(yAxis)) return;

		yAxis.attr('font-size', renderScale() * 9).style('stroke-width', renderScale);

		const base = yAxis.selectAll('*').empty()
			? yAxis
			: yAxis.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear);

		d3Ticks(
			base.call(
				d3
					.axisLeft(yInSelection())
					.ticks(6)
					.tickSize(6 * renderScale())
					.tickSizeInner(6 * renderScale())
					.tickSizeOuter(6 * renderScale())
					.tickPadding(3 * renderScale()),
			),
		)
			.attr('font-size', renderScale() * 9)
			.style('stroke-width', renderScale());
		// .call((g) => g.select('.domain').remove())
		// .call((g) => g.selectAll('.tick line').clone().attr('x2', width).attr('stroke-opacity', 0.1));
	});

	// update animation line
	createEffect(function lineAreaChartUpdateAnimationLineEffect() {
		const { animationLine } = svgParts();
		if (!isFilledD3Selection(animationLine)) return;
		const _x = x();

		const base =
			animationLine.attr('data-existed') === 'true'
				? animationLine.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear)
				: animationLine;
		base.attr('data-existed', 'true');
		base.attr('x1', _x(debouncedMsIntoGame()));
		base.attr('x2', _x(debouncedMsIntoGame()));
	});

	return (
		<div class="snap-start snap-normal overflow-hidden">
			<h3 class="-mb-3 pt-2 text-center">{props.header}</h3>
			<svg
				ref={setSvgRef}
				width={widthWithMargin()}
				height={heightWithMargin()}
				viewBox={`0 0 ${widthWithMargin()} ${heightWithMargin()}`}
				class="mx-auto h-auto w-full max-w-[550px] touch-none select-none"
			/>
			<Table>
				<TableBody>
					<For each={props.variables}>
						{(variable) => (
							<LineAreaChartVarRow
								variable={variable}
								selectedVars={selectedVars()}
								onCheckedChange={(c) => onVariableCheckedChange(variable.key, c === true)}
							/>
						)}
					</For>
				</TableBody>
			</Table>
		</div>
	);
};

interface LineAreaChartVarRowProps {
	variable: LineChartVariableDescription;
	selectedVars: FrameEndEventNumberKey[];
	onCheckedChange: (checked: boolean) => void;
}

const LineAreaChartVarRow: Component<LineAreaChartVarRowProps> = (props) => {
	const id = createUniqueId();
	const isV1 = uiStore.isV1;

	const isShowable = () => isShownInGraph(props.variable);

	const value = () => {
		return animationStore.currentFrameEndEvent()?.[props.variable.key] ?? 0;
	};

	const checked = () => props.selectedVars.includes(props.variable.key);

	return (
		<TableRow>
			<TableCell class={isV1() ? '' : 'p-2 pl-3'}>
				<div class="flex flex-row items-center gap-2">
					<Show when={isShowable()} fallback={<span class="inline-block w-5" />}>
						<Tooltip placement="left">
							<TooltipTrigger
								as={Checkbox}
								id={id + props.variable.key + '_checkbox'}
								checked={checked()}
								onChange={props.onCheckedChange}
								controlClass={props.variable.color.checkboxSolid}
							/>
							<TooltipContent class="max-w-96">{props.variable.description}</TooltipContent>
						</Tooltip>
					</Show>
					<Tooltip placement="left" gutter={36}>
						<TooltipTrigger
							as={'label'}
							for={id + props.variable.key + '_checkbox-input'}
							class="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{props.variable.name}
						</TooltipTrigger>
						<TooltipContent class="max-w-96">{props.variable.description}</TooltipContent>
					</Tooltip>
				</div>
			</TableCell>
			<TableCell class={isV1() ? '' : 'text-nowrap p-2 text-right'}>
				<>{value()}</>
				<span class="ml-2">
					<Dynamic component={props.variable.UnitIcon} class="inline-block h-auto w-5" />
				</span>
			</TableCell>
		</TableRow>
	);
};
