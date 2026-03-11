import * as d3 from 'd3';
import {
	type Component,
	For,
	type JSXElement,
	Show,
	createEffect,
	createMemo,
	createSignal,
	createUniqueId,
	onCleanup,
	untrack,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Checkbox } from '~/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { type FrameEndEvent, type FrameEndEventNumberKey } from '../../parser';
import { createAutoSizeCanvas } from '../canvas';
import { ColorClasses } from '../colors';
import {
	MsIntoGameChangeType,
	useAnimationStore,
	useExtraChartStore,
	useGameplayStore,
	useHoverMsStore,
	useRoomDisplayStore,
	useThemeStore,
	useViewportStore,
} from '../store';
import { chartBaseHeight, chartBaseWidth, getChartFrame } from './chart-frame';
import { downScale } from './down-scale';
import type { InitMessage, ResizeMessage, SetDataMessage, SetViewMessage } from './line-area-chart-render.worker';
import { createIsVisible } from './use-is-visible';

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
	icon: JSXElement;
	header: JSXElement;
	minimalMaximumY: number;
	downScaleMaxTimeDelta: number;
	renderScale?: number;
}

export const LineAreaChart: Component<LineAreaChartProps> = (props) => {
	const roomDisplayStore = useRoomDisplayStore();
	const extraChartStore = useExtraChartStore();
	const animationStore = useAnimationStore();
	const gameplayStore = useGameplayStore();
	const hoverMsStore = useHoverMsStore();
	const viewportStore = useViewportStore();

	const variablesPerKey = createMemo(() => {
		return Object.fromEntries(props.variables.map((it) => [it.key, it] as const));
	});

	const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement | null>(null);
	const [overlayCanvasRef, setOverlayCanvasRef] = createSignal<HTMLCanvasElement | null>(null);
	const [chartContainerRef, setChartContainerRef] = createSignal<HTMLDivElement | null>(null);
	const autoSizedOverlayCanvas = createAutoSizeCanvas(chartContainerRef, overlayCanvasRef);

	const isVisible = createIsVisible(canvasRef);

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

	// Brush selection state
	const [brushStart, setBrushStart] = createSignal<number | null>(null);
	const [brushEnd, setBrushEnd] = createSignal<number | null>(null);

	// Mouse interaction handlers
	function mouseToMsIntoGame(e: MouseEvent) {
		return untrack(() => {
			const canvas = canvasRef();
			if (!canvas) return 0;
			const extraChartsTimeBounds = extraChartStore.timeBoundsTransition();
			const rect = canvas.getBoundingClientRect();
			const chartFrame = getChartFrame(rect.width, rect.height);
			const x = e.clientX - rect.left - chartFrame.marginLeft;
			const chartWidth = chartFrame.width;
			return Math.round(
				extraChartsTimeBounds[0] + (extraChartsTimeBounds[1] - extraChartsTimeBounds[0]) * (x / chartWidth),
			);
		});
	}

	function sceneFromMs(ms: number) {
		const recording = gameplayStore.recording();
		if (!recording) return null;
		return recording.sceneEventFromMs(ms);
	}

	let didHoldAction = false;
	let holdTimeout: number | null = null;
	let holdStartMousePosition = { x: 0, y: 0 };
	let currentMousePosition = { x: 0, y: 0 };
	let modifierDragLastClientX: number | null = null;
	let activePointerId: number | null = null;
	let didModifierDeltaDrag = false;
	let suppressNextModifierClick = false;
	let renderWorker: Worker | null = null;
	let workerReady = false;
	const isDarkTheme = createMemo(() => useThemeStore().currentTheme() === 'dark');

	const workerSeries = createMemo(() => {
		const _series = series();
		const _variablesPerKey = variablesPerKey();
		const _isDarkTheme = isDarkTheme();
		return _series
			.map((s) => {
				const colorClass = _variablesPerKey[s.key]?.color;
				if (!colorClass) return null;
				return {
					color: _isDarkTheme ? colorClass.hexDark : colorClass.hexLight,
					points: s.map((d) => ({
						ms: d.data?.msIntoGame ?? 0,
						y0: d[0],
						y1: d[1],
					})),
				};
			})
			.filter((it): it is { color: string; points: { ms: number; y0: number; y1: number }[] } => it !== null);
	});

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
				moveToMsIntoGame(e, 'smooth');
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

	function moveToMsIntoGame(e: MouseEvent, changeType: MsIntoGameChangeType) {
		const ms = mouseToMsIntoGame(e);
		animationStore.setMsIntoGame(ms, changeType);
		const scene = sceneFromMs(ms)?.getMainVirtualSceneName();
		if (scene) {
			roomDisplayStore.setSelectedSceneName(scene);
		}
	}

	function moveByDeltaMsIntoGame(e: MouseEvent) {
		const canvas = canvasRef();
		if (!canvas) return;

		const currentClientX = e.clientX;
		if (modifierDragLastClientX === null) {
			modifierDragLastClientX = currentClientX;
			return;
		}

		const deltaX = currentClientX - modifierDragLastClientX;
		modifierDragLastClientX = currentClientX;
		if (deltaX === 0) return;
		didModifierDeltaDrag = true;

		const rect = canvas.getBoundingClientRect();
		const chartFrame = getChartFrame(rect.width, rect.height);
		const chartWidth = chartFrame.width;
		if (chartWidth <= 0) return;

		const timeBounds = extraChartStore.timeBoundsTransition();
		const msPerPixel = (timeBounds[1] - timeBounds[0]) / chartWidth;
		const nextMs = animationStore.msIntoGame() + deltaX * msPerPixel;

		animationStore.setMsIntoGame(nextMs, 'instant');
		const scene = sceneFromMs(animationStore.msIntoGame())?.getMainVirtualSceneName();
		if (scene) {
			roomDisplayStore.setSelectedSceneName(scene);
		}
	}

	function clampBrushXToChart(canvas: HTMLCanvasElement, rawX: number) {
		const rect = canvas.getBoundingClientRect();
		const chartFrame = getChartFrame(rect.width, rect.height);
		const chartLeft = chartFrame.marginLeft;
		const chartWidth = chartFrame.width;
		const chartRight = chartLeft + chartWidth;
		return Math.max(chartLeft, Math.min(chartRight, rawX));
	}

	function handleModifierDragMove(e: MouseEvent) {
		const isModifierSeek = (e.ctrlKey || e.metaKey) && e.buttons !== 0;
		if (!isModifierSeek) {
			modifierDragLastClientX = null;
			return;
		}

		const timeFrame = gameplayStore.timeFrame();
		const currentBounds = extraChartStore.timeBoundsTransition();
		const epsilonMs = 1;
		const isFullRangeVisible =
			Math.abs(currentBounds[0] - timeFrame.min) <= epsilonMs &&
			Math.abs(currentBounds[1] - timeFrame.max) <= epsilonMs;

		if (extraChartStore.followsAnimation() && !isFullRangeVisible) {
			moveByDeltaMsIntoGame(e);
		} else {
			modifierDragLastClientX = e.clientX;
			moveToMsIntoGame(e, 'instant');
		}
	}

	// Canvas event handlers
	function handleMouseMove(e: MouseEvent) {
		handleModifierDragMove(e);

		const ms = mouseToMsIntoGame(e);
		hoverMsStore.setHoveredMsIntoGame(ms);
		const scene = sceneFromMs(ms)?.getMainVirtualSceneName();
		if (scene) {
			roomDisplayStore.setHoveredRoom(scene);
			roomDisplayStore.setSelectedRoomIfNotPinned(scene);
		}

		if (brushStart() !== null) {
			const canvas = canvasRef();
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			const mouseX = clampBrushXToChart(canvas, e.clientX - rect.left);
			setBrushEnd(mouseX);
		}
	}

	function handleMouseLeave() {
		hoverMsStore.setHoveredMsIntoGame(null);
		roomDisplayStore.setHoveredRoom(null);
		modifierDragLastClientX = null;
	}

	function handlePointerMove(e: PointerEvent) {
		currentMousePosition = { x: e.clientX, y: e.clientY };
		handleModifierDragMove(e);

		if (brushStart() !== null) {
			const canvas = canvasRef();
			if (canvas) {
				const rect = canvas.getBoundingClientRect();
				setBrushEnd(clampBrushXToChart(canvas, e.clientX - rect.left));
			}
		}

		e.preventDefault();
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
			modifierDragLastClientX = e.clientX;
			didModifierDeltaDrag = false;
			return;
		}

		startHold(e);
		const canvas = canvasRef();
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const mouseX = clampBrushXToChart(canvas, e.clientX - rect.left);
		activePointerId = e.pointerId;
		canvas.setPointerCapture(e.pointerId);
		setBrushStart(mouseX);
		setBrushEnd(mouseX);
	}

	function handlePointerUp(e: PointerEvent) {
		const canvas = canvasRef();
		if (activePointerId !== null && canvas?.hasPointerCapture(activePointerId)) {
			canvas.releasePointerCapture(activePointerId);
		}
		activePointerId = null;

		cancelHold();
		modifierDragLastClientX = null;
		if (didModifierDeltaDrag) {
			suppressNextModifierClick = true;
		}
		didModifierDeltaDrag = false;

		if (brushStart() !== null && canvas) {
			const rect = canvas.getBoundingClientRect();
			setBrushEnd(clampBrushXToChart(canvas, e.clientX - rect.left));
		}

		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
			setBrushStart(null);
			setBrushEnd(null);
			didHoldAction = false;
			return;
		}

		const start = brushStart();
		const end = brushEnd();

		if (start !== null && end !== null && Math.abs(end - start) > 5) {
			// Calculate the selection in data space
			const canvas = canvasRef();
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			const chartFrame = getChartFrame(rect.width, rect.height);
			const marginLeftPx = chartFrame.marginLeft;
			const chartWidth = chartFrame.width;

			const x1 = (Math.min(start, end) - marginLeftPx) / chartWidth;
			const x2 = (Math.max(start, end) - marginLeftPx) / chartWidth;

			const timeBounds = extraChartStore.timeBoundsTransition();
			const msStart = timeBounds[0] + (timeBounds[1] - timeBounds[0]) * x1;
			const msEnd = timeBounds[0] + (timeBounds[1] - timeBounds[0]) * x2;

			extraChartStore.setTimeBoundsStopFollowIfOutside([msStart, msEnd] as const);
		} else if (!didHoldAction && Math.abs((end ?? start ?? 0) - (start ?? 0)) <= 5) {
			// Single click without drag - reset zoom
			extraChartStore.resetTimeBounds();
		}

		setBrushStart(null);
		setBrushEnd(null);
		didHoldAction = false;
	}

	function handlePointerCancel() {
		const canvas = canvasRef();
		if (activePointerId !== null && canvas?.hasPointerCapture(activePointerId)) {
			canvas.releasePointerCapture(activePointerId);
		}
		activePointerId = null;
		cancelHold();
		modifierDragLastClientX = null;
		didModifierDeltaDrag = false;
		setBrushStart(null);
		setBrushEnd(null);
		didHoldAction = false;
	}

	function handleClick(e: MouseEvent) {
		cancelHold();
		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
			if (suppressNextModifierClick) {
				suppressNextModifierClick = false;
				e.preventDefault();
				return;
			}
			moveToMsIntoGame(e, 'smooth');
			e.preventDefault();
		}
	}

	// Render brush selection on overlay canvas
	function renderOverlay() {
		const canvas = overlayCanvasRef();
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const sizedCanvas = autoSizedOverlayCanvas();
		if (!sizedCanvas.canvas) return;

		const displayWidth = sizedCanvas.widthInUnits || chartBaseWidth;
		const displayHeight = sizedCanvas.heightInUnits || chartBaseHeight;
		const chartFrame = getChartFrame(displayWidth, displayHeight);
		const ratio = sizedCanvas.canvas.width / Math.max(displayWidth, 1);
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

		ctx.clearRect(0, 0, displayWidth, displayHeight);

		const bounds = extraChartStore.timeBoundsTransition();
		const currentMs = animationStore.msIntoGame() ?? gameplayStore.timeFrame().min;
		const hoverMs = hoverMsStore.hoveredMsIntoGame();
		const domainSpan = bounds[1] - bounds[0];
		if (domainSpan > 0) {
			const _marginLeft = chartFrame.marginLeft;
			const _marginTop = chartFrame.marginTop;
			const _width = chartFrame.width;
			const _height = chartFrame.height;
			const currentT = (currentMs - bounds[0]) / domainSpan;

			function isInsideChartX(t: number) {
				return t >= 0 && t <= 1;
			}

			const textColor = isDarkTheme() ? '#fff' : '#000';

			if (hoverMs != null) {
				const hoverT = (hoverMs - bounds[0]) / domainSpan;
				if (isInsideChartX(hoverT)) {
					const hoverLineX = _marginLeft + _width * hoverT;
					ctx.strokeStyle = textColor;
					ctx.lineWidth = 1;
					ctx.setLineDash([2, 2]);
					ctx.beginPath();
					ctx.moveTo(hoverLineX, _marginTop);
					ctx.lineTo(hoverLineX, _marginTop + _height);
					ctx.stroke();
				}
			}

			if (isInsideChartX(currentT)) {
				const currentLineX = _marginLeft + _width * currentT;
				ctx.strokeStyle = textColor;
				ctx.lineWidth = 2;
				ctx.setLineDash([3, 3]);
				ctx.beginPath();
				ctx.moveTo(currentLineX, _marginTop);
				ctx.lineTo(currentLineX, _marginTop + _height);
				ctx.stroke();
			}
			ctx.setLineDash([]);
		}

		const start = brushStart();
		const end = brushEnd();

		if (start !== null && end !== null) {
			const minX = Math.min(start, end);
			const maxX = Math.max(start, end);
			const _marginTop = chartFrame.marginTop;
			const _height = chartFrame.height;

			ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
			ctx.fillRect(minX, _marginTop, maxX - minX, _height);

			ctx.strokeStyle = 'rgba(128, 128, 128, 0.8)';
			ctx.lineWidth = 1;
			ctx.strokeRect(minX, _marginTop, maxX - minX, _height);
		}
	}

	createEffect(() => {
		const canvas = canvasRef();
		if (!canvas || renderWorker || typeof Worker === 'undefined') return;
		if (typeof canvas.transferControlToOffscreen !== 'function') return;

		renderWorker = new Worker(new URL('./line-area-chart-render.worker.ts', import.meta.url), { type: 'module' });
		const offscreen = canvas.transferControlToOffscreen();
		const message: InitMessage = { type: 'init', canvas: offscreen };
		renderWorker.postMessage(message, [offscreen]);
		workerReady = true;

		onCleanup(() => {
			renderWorker?.terminate();
			renderWorker = null;
			workerReady = false;
		});
	});

	createEffect(() => {
		const canvas = canvasRef();
		if (!canvas) return;
		const overlaySize = autoSizedOverlayCanvas();
		viewportStore.visualViewportScale();

		const fallbackDisplayWidth = chartContainerRef()?.offsetWidth || chartBaseWidth;
		const fallbackDisplayHeight = chartContainerRef()?.offsetHeight || chartBaseHeight;
		const displayWidth = Math.max(1, overlaySize.widthInUnits || fallbackDisplayWidth);
		const displayHeight = Math.max(1, overlaySize.heightInUnits || fallbackDisplayHeight);
		const zoom = window.visualViewport?.scale ?? 1;
		const ratio = (window.devicePixelRatio || 1) * zoom;

		const pixelWidth = Math.max(1, overlaySize.canvas?.width ?? Math.round(displayWidth * ratio));
		const pixelHeight = Math.max(1, overlaySize.canvas?.height ?? Math.round(displayHeight * ratio));

		if (renderWorker && workerReady) {
			const message: ResizeMessage = {
				type: 'resize',
				displayWidth,
				displayHeight,
				pixelWidth,
				pixelHeight,
			};
			renderWorker.postMessage(message);
		} else {
			canvas.width = pixelWidth;
			canvas.height = pixelHeight;
		}
	});

	createEffect(() => {
		if (!renderWorker || !workerReady) return;
		const dataForWorker = workerSeries();
		const message: SetDataMessage = {
			type: 'setData',
			series: dataForWorker,
			yAxisLabel: props.yAxisLabel,
			minimalMaximumY: props.minimalMaximumY,
		};
		renderWorker.postMessage(message);
	});

	createEffect(() => {
		if (!renderWorker || !workerReady || !isVisible()) return;
		const canvas = canvasRef();
		if (!canvas) return;
		const message: SetViewMessage = {
			type: 'setFrame',
			timeBoundsAnimated: extraChartStore.timeBoundsTransition(),
			timeBoundsTarget: extraChartStore.timeBounds(),
			axisColor: isDarkTheme() ? '#fff' : '#000',
		};
		renderWorker.postMessage(message);
	});

	createEffect(() => {
		autoSizedOverlayCanvas();
		brushStart();
		brushEnd();
		animationStore.msIntoGame();
		hoverMsStore.hoveredMsIntoGame();
		extraChartStore.timeBoundsTransition();
		gameplayStore.timeFrame();
		isDarkTheme();
		untrack(() => {
			renderOverlay();
		});
	});

	return (
		<div class="flex shrink grow basis-0 snap-start snap-normal flex-col overflow-hidden">
			<div
				ref={setChartContainerRef}
				class="relative mx-auto max-h-70 min-h-23 w-full shrink grow basis-0"
				style={{ 'max-width': '550px' }}
			>
				<canvas
					ref={setCanvasRef}
					width={chartBaseWidth}
					height={chartBaseHeight}
					class="absolute inset-0 block h-full w-full touch-none select-none"
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
					onPointerMove={handlePointerMove}
					onPointerDown={handlePointerDown}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerCancel}
					onClick={handleClick}
				/>
				<canvas
					ref={setOverlayCanvasRef}
					width={chartBaseWidth}
					height={chartBaseHeight}
					class="pointer-events-none absolute inset-0 h-full w-full touch-none select-none"
				/>
			</div>
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
	const animationStore = useAnimationStore();
	const hoverMsStore = useHoverMsStore();

	const isShowable = () => isShownInGraph(props.variable);

	const value = () => {
		return animationStore.currentFrameEndEvent()?.[props.variable.key] ?? 0;
	};

	const valueHover = () => {
		const hoveredFrameEndEvent = hoverMsStore.hoveredFrameEndEvent();
		if (!hoveredFrameEndEvent) return null;
		return hoveredFrameEndEvent[props.variable.key] ?? null;
	};

	const checked = () => props.selectedVars.includes(props.variable.key);

	return (
		<TableRow>
			<TableCell class="p-2 pl-3">
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
							class="grow text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{props.variable.name}
						</TooltipTrigger>
						<TooltipContent class="max-w-96">{props.variable.description}</TooltipContent>
					</Tooltip>
				</div>
			</TableCell>

			<Show when={valueHover() !== null}>
				<TableCell class="p-2 py-1 text-right text-nowrap">
					<span class="text-muted-foreground mr-2">{valueHover()}</span>
				</TableCell>
			</Show>
			<TableCell class="p-2 py-1 text-right text-nowrap">
				<>{value()}</>
				<span class="ml-2">
					<Dynamic component={props.variable.UnitIcon} class="inline-block h-auto w-5" />
				</span>
			</TableCell>
		</TableRow>
	);
};
