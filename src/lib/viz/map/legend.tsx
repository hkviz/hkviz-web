import * as d3 from 'd3';
import { ChevronsUpDownIcon } from 'lucide-solid';
import { createMemo, For, Show, type Component } from 'solid-js';
import { Expander } from '~/components/ui/additions';
import { Card } from '~/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import {
	useAggregationStore,
	useAnimationStore,
	useGameplayStore,
	useRoomColoringStore,
	useRoomDisplayStore,
	useThemeStore,
} from '../store';
import {
	aggregationVariableDefaultValue,
	aggregationVariableInfos,
	formatAggregatedVariableValue,
	getVirtualSceneNameForHeatMap,
} from '../store/aggregations/aggregate-recording';
import { RoomColorMapDropdown } from './room-color-map-dropdown';

const LEGEND_PADDING = 30;
const LEGEND_RAMP_WIDTH = 200;
const LEGEND_RAMP_BAR_WIDTH = 2;
const LEGEND_RAMP_Y = 40;
const LEGEND_COLOR_RAMP_HEIGHT = 18;
const LEGEND_TICK_STEPS = 3;
const LEGEND_TICK_LABEL_OFFSET_Y = 20;
const LEGEND_TICK_POINTER_OFFSET_Y = 10;
const LEGEND_CURRENT_POINTER_OFFSET_Y = 10;
const LEGEND_CURRENT_VALUE_OFFSET_Y = 20;
const LEGEND_TRIANGLE_SIZE = 20;

const LEGEND_SVG_WIDTH = LEGEND_RAMP_WIDTH + LEGEND_PADDING * 2;
const LEGEND_TICK_LABEL_Y = LEGEND_RAMP_Y - LEGEND_TICK_LABEL_OFFSET_Y;
const LEGEND_TICK_POINTER_Y = LEGEND_RAMP_Y - LEGEND_TICK_POINTER_OFFSET_Y;
const LEGEND_CURRENT_POINTER_Y = LEGEND_RAMP_Y + LEGEND_COLOR_RAMP_HEIGHT + LEGEND_CURRENT_POINTER_OFFSET_Y;
const LEGEND_CURRENT_VALUE_Y = LEGEND_CURRENT_POINTER_Y + LEGEND_CURRENT_VALUE_OFFSET_Y;
const LEGEND_SVG_HEIGHT = LEGEND_CURRENT_VALUE_Y + LEGEND_TICK_POINTER_OFFSET_Y;

const LEGEND_SVG_TEXT_CLASSES = 'text-black dark:text-white fill-current';

export const MapLegend: Component = () => {
	const animationStore = useAnimationStore();
	const roomDisplayStore = useRoomDisplayStore();
	const roomColoringStore = useRoomColoringStore();
	const aggregationStore = useAggregationStore();
	const gameplayStore = useGameplayStore();
	const themeStore = useThemeStore();

	const var1 = roomColoringStore.var1;
	const mode = roomColoringStore.colorMode;
	const var1Info = () => aggregationVariableInfos[var1()];
	const hoveredRoom = roomDisplayStore.hoveredSceneName;
	const hoveredVirtualScene = () => {
		const room = hoveredRoom();
		if (!room) return null;
		return getVirtualSceneNameForHeatMap(room, roomDisplayStore.areaSelectionMode());
	};
	const var1SelectedRoomValue = () =>
		hoveredRoom()
			? (aggregationStore.data()?.countPerScene?.[hoveredVirtualScene()!]?.[var1()] ??
				aggregationVariableDefaultValue(var1()))
			: null;
	const var1Max = roomColoringStore.var1Max;
	const singleVarColormap = roomColoringStore.singleVarColorMap;

	const showSelectedTimeComment = () => {
		return (
			aggregationStore.aggregationCountMode() !== 'total' &&
			gameplayStore.timeFrame().max - animationStore.msIntoGame() > 10
		);
	};

	const legendScale = createMemo(() => {
		const max = Math.max(var1Max(), 1);
		return d3
			.scaleLinear()
			.domain([0, max])
			.range([LEGEND_PADDING, LEGEND_PADDING + LEGEND_RAMP_WIDTH]);
	});

	const tickX = (d: number) => legendScale()(d);

	const rampData = createMemo(() =>
		d3.range(LEGEND_RAMP_WIDTH).map((i) => Math.round((var1Max() * i) / LEGEND_RAMP_WIDTH)),
	);

	const steps = createMemo(() => {
		const max = var1Max();
		if (max <= 0) return [0];
		return [...new Set(d3.range(0, max + 0.0001, max / LEGEND_TICK_STEPS).map((d) => Math.round(d)))].sort(
			(a, b) => a - b,
		);
	});

	const trianglePath = createMemo(() => d3.symbol().size(LEGEND_TRIANGLE_SIZE).type(d3.symbolTriangle)() ?? '');

	return (
		<Card class="rounded-sm text-center" hidden={mode() === 'area'}>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<div class="flex flex-col items-center justify-center">
						<div class="flex flex-row items-center justify-center px-0.5">
							<span class="pr-2 pl-1 text-sm">{var1Info()?.name ?? ''} </span>
							<span class="text-muted-foreground text-[0.65rem]">
								{roomColoringStore.var1Curve().shortName}
							</span>
							<ChevronsUpDownIcon class="text-muted-foreground size-2" />
						</div>
						<Expander expanded={showSelectedTimeComment()}>
							<div class="text-muted-foreground text-[0.65rem]">Up to the selected time</div>
						</Expander>
						<svg class="w-36" viewBox={`0 0 ${LEGEND_SVG_WIDTH} ${LEGEND_SVG_HEIGHT}`}>
							{/* Color ramp */}
							<g>
								<For each={rampData()}>
									{(value, index) => (
										<rect
											fill={singleVarColormap()(value)}
											stroke="none"
											y={LEGEND_RAMP_Y}
											x={index() + LEGEND_PADDING}
											width={LEGEND_RAMP_BAR_WIDTH}
											height={LEGEND_COLOR_RAMP_HEIGHT}
										/>
									)}
								</For>
							</g>

							{/* Tick labels */}
							<g>
								<For each={steps()}>
									{(step) => (
										<text
											class={LEGEND_SVG_TEXT_CLASSES}
											stroke="none"
											y={LEGEND_TICK_LABEL_Y}
											x={tickX(step)}
											text-anchor="middle"
										>
											{formatAggregatedVariableValue(var1(), step)}
										</text>
									)}
								</For>
							</g>

							{/* Tick pointers */}
							<g>
								<For each={steps()}>
									{(step) => (
										<path
											d={trianglePath()}
											class={LEGEND_SVG_TEXT_CLASSES}
											transform={`translate(${tickX(step)}, ${LEGEND_TICK_POINTER_Y}) rotate(180)`}
										/>
									)}
								</For>
							</g>

							<Show when={var1SelectedRoomValue() != null}>
								{/* Current room marker */}
								<g>
									<text
										class={LEGEND_SVG_TEXT_CLASSES}
										stroke="none"
										y={LEGEND_CURRENT_VALUE_Y}
										x={tickX(var1SelectedRoomValue()!)}
										text-anchor="middle"
									>
										{formatAggregatedVariableValue(var1(), var1SelectedRoomValue()!)}
									</text>
									<g>
										<path
											d={trianglePath()}
											class={LEGEND_SVG_TEXT_CLASSES}
											transform={`translate(${tickX(var1SelectedRoomValue()!)}, ${LEGEND_CURRENT_POINTER_Y})`}
										/>
									</g>
								</g>
							</Show>
						</svg>
					</div>
				</DropdownMenuTrigger>
				<RoomColorMapDropdown />
			</DropdownMenu>
		</Card>
	);
};
