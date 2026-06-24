import * as d3 from 'd3';
import { ChevronsUpDownIcon } from 'lucide-solid';
import { createEffect, createMemo, For, Show } from 'solid-js';
import { Expander } from '~/components/ui/additions/expander';
import { Card } from '~/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import type { GameId } from '~/lib/types/game-ids';
import { useAggregationStore } from '../store/aggregation-store';
import { useAnimationStore } from '../store/animation-store';
import { useGameplayStore } from '../store/gameplay-store';
import { useRoomColoringStore } from '../store/room-coloring-store';
import { useRoomDisplayStore } from '../store/room-display-store';
import { RoomColorMapDropdown } from './room-color-map-dropdown';
import { useLocalizationStore } from '../store/localization-store';
import { InteropMenu } from '~/components/ui/interop-menu';

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

export function MapLegend<Game extends GameId>() {
	const animationStore = useAnimationStore();
	const roomDisplayStore = useRoomDisplayStore();
	const roomColoringStore = useRoomColoringStore();
	const aggregationStore = useAggregationStore();
	const gameplayStore = useGameplayStore<Game>();
	const localizationStore = useLocalizationStore();

	const var1 = roomColoringStore.var1;
	const mode = roomColoringStore.colorMode;
	const var1Info = () => gameplayStore.gameModule()?.aggregation.variableInfos?.[var1()];

	createEffect(() => {
		console.log('var1', var1());
		console.log('var1 info', var1Info());
	});

	createEffect(() => {
		const v1 = var1Info();
		console.log('name', v1, v1 ? localizationStore.getString(v1.name) : '');
	});

	const hoveredRoom = roomDisplayStore.hoveredSceneName;
	const hoveredVirtualScene = () => {
		const room = hoveredRoom();
		if (!room) return null;
		return aggregationStore.getVirtualSceneNameForHeatMap(room);
	};

	const var1SelectedRoomValue = () => {
		const hovered = hoveredVirtualScene();
		if (!hovered) return null;
		return aggregationStore.getCurrentCorrectedAggregationValue(hovered, var1()) ?? null;
	};

	const var1Min = roomColoringStore.var1Min;
	const var1Max = roomColoringStore.var1Max;
	const var1Delta = roomColoringStore.var1Delta;

	const singleVarColormap = roomColoringStore.singleVarColorMap;

	const showSelectedTimeComment = () => {
		return (
			aggregationStore.aggregationCountMode() === 'until-current-time' &&
			gameplayStore.timeFrameDisplay().max - animationStore.msIntoGame() > 10
		);
	};

	const showSelectedTimeframeComment = () => {
		return aggregationStore.aggregationCountMode() === 'custom';
	};

	const legendScale = createMemo(() => {
		const min = var1Min();
		let max = var1Max();

		if (min === max) {
			max = min + 1;
		}

		return d3
			.scaleLinear()
			.domain([min, max])
			.range([LEGEND_PADDING, LEGEND_PADDING + LEGEND_RAMP_WIDTH]);
	});

	const tickX = (d: number) => legendScale()(d);

	const rampData = createMemo(() =>
		d3.range(LEGEND_RAMP_WIDTH).map((i) => var1Min() + Math.round((var1Delta() * i) / LEGEND_RAMP_WIDTH)),
	);

	const steps = createMemo(() => {
		const delta = var1Delta();
		const min = var1Min();
		if (delta <= 0) return [0];

		const forceZeroTick = min < 0 && Math.abs(min) > delta * 0.3;

		const nSteps = forceZeroTick ? 1 : LEGEND_TICK_STEPS;
		const options = new Set(d3.range(0, delta + 0.0001, delta / nSteps).map((d) => Math.round(min + d)));
		if (forceZeroTick) {
			options.add(0);
		}

		return [...options].sort((a, b) => a - b);
	});

	const trianglePath = createMemo(() => d3.symbol().size(LEGEND_TRIANGLE_SIZE).type(d3.symbolTriangle)() ?? '');

	return (
		<Card class="rounded-sm text-center" hidden={mode() === 'area'}>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<div class="flex flex-col items-center justify-center">
						<div class="flex flex-row items-center justify-center px-0.5">
							<span class="pr-2 pl-1 text-sm">
								<Show when={var1Info()}>
									{(var1Info) => <>{localizationStore.getString(var1Info().name)}</>}
								</Show>
							</span>
							<span class="text-[0.65rem] text-muted-foreground">
								{roomColoringStore.var1Curve().shortName}
							</span>
							<ChevronsUpDownIcon class="size-2 text-muted-foreground" />
						</div>
						<Expander expanded={showSelectedTimeComment()}>
							<div class="text-[0.65rem] text-muted-foreground">Up to the selected time</div>
						</Expander>
						<Expander expanded={showSelectedTimeframeComment()}>
							<div class="text-[0.65rem] text-muted-foreground">Within selected timeframe</div>
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
											{var1Info()?.format(step)}
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
										{var1Info()?.format(var1SelectedRoomValue())}
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
				<DropdownMenuContent>
					<InteropMenu mode="dropdown">
						<RoomColorMapDropdown variable={roomColoringStore.var1()} />
					</InteropMenu>
				</DropdownMenuContent>
			</DropdownMenu>
		</Card>
	);
}
