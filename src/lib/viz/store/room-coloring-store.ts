import type * as d3 from 'd3';
import { memoize } from 'micro-memoize';
import { batch, createContext, createMemo, createSignal, useContext } from 'solid-js';
import type { AggregationVariableAny } from '~/lib/aggregation/aggregation-value-specific';
import type { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { isRoomDataSilk } from '~/lib/game-data/specific/room-data-of-game';
import { RoomColorCurveExponential, RoomColorCurveLinear, type RoomColorCurve } from '../color-curves';
import type { ColorMapId } from '../color-map';
import { getRoomColorMapById } from '../color-map';
import type { AggregationStore } from './aggregation-store';
import type { AnimationStore } from './animation-store';
import type { GameplayStore } from './gameplay-store';
import type { RoomDisplayStore } from './room-display-store';
import type { ThemeStore } from './theme-store';
import type { AggregationDisplayStore } from './aggregation-display-store';
import { assertNever } from '~/lib/util/other';

function hslEquals(a: d3.HSLColor, b: d3.HSLColor) {
	return a.h === b.h && a.s === b.s && a.l === b.l;
}

export const changeRoomColorForLightTheme = memoize(
	function changeRoomColorForLightTheme(color: d3.HSLColor): string {
		return color.copy({ l: Math.max(color.l, 0.3) * 0.5, s: Math.max((color.s * 0.8) ** 0.8, 0.1) }).formatHsl();
	},
	{
		isEqual: hslEquals,
		maxSize: 1000,
	},
);

export const changeRoomColorForDarkTheme = memoize(
	function changeRoomColorForDarkTheme(color: d3.HSLColor): string {
		return color.copy({ l: color.l * 0.8, s: color.s * 0.75 }).formatHsl();
	},
	{
		isEqual: hslEquals,
		maxSize: 1000,
	},
);

export type RoomColorMode = 'area' | '1-var';
export type RoomColorRangeMode = 'gameplay' | 'visible';

export function createRoomColoringStore(
	themeStore: ThemeStore,
	roomDisplayStore: RoomDisplayStore,
	aggregationStore: AggregationStore,
	aggregationDisplayStore: AggregationDisplayStore,
	animationStore: AnimationStore,
	gameplayStore: GameplayStore,
) {
	const gameModule = gameplayStore.gameModule;
	const [colorMode, setColorMode] = createSignal<RoomColorMode>('area');
	const [var1, setVar1] = createSignal<AggregationVariable>(
		'damageTaken' satisfies AggregationVariableAny as AggregationVariable,
	);
	const [var1Curve, setVar1Curve] = createSignal<RoomColorCurve>(RoomColorCurveLinear);
	const [singleVarColorMapId, setSingleVarColorMapId] = createSignal<ColorMapId>('viridis-cool');
	const [rangeMode, setRangeMode] = createSignal<RoomColorRangeMode>('gameplay');

	function reset() {
		setColorMode('area');
		setVar1('damageTaken' satisfies AggregationVariableAny as AggregationVariable);
		setVar1Curve(RoomColorCurveLinear);
		setSingleVarColorMapId('viridis-cool');
		setRangeMode('gameplay');
	}

	const var1Min = createMemo(() => {
		const mode = rangeMode();
		if (mode === 'visible') {
			return aggregationDisplayStore.minValue() ?? 0;
		} else if (mode === 'gameplay') {
			const aggregatedRunData = aggregationStore.aggregations();
			const areaSelectionMode = roomDisplayStore.areaSelectionMode();
			const minMode = areaSelectionMode === 'zone' ? 'overZones' : 'overScenes';
			const value = aggregatedRunData?.minPerMode[minMode]?.getValue(var1());
			return value ?? 0;
		}
		return assertNever(mode);
	});

	const var1Max = createMemo(() => {
		const mode = rangeMode();
		if (mode === 'visible') {
			return aggregationDisplayStore.maxValue() ?? 1;
		} else if (mode === 'gameplay') {
			const aggregatedRunData = aggregationStore.aggregations();
			const areaSelectionMode = roomDisplayStore.areaSelectionMode();
			const maxMode = areaSelectionMode === 'zone' ? 'overZones' : 'overScenes';
			const value = aggregatedRunData?.maxPerMode[maxMode]?.getValue(var1());
			return value ?? 0;
		}
		return assertNever(mode);
	});

	const var1Delta = createMemo(() => {
		return var1Max() - var1Min();
	});

	const singleVarColorMapType = createMemo(() => getRoomColorMapById(singleVarColorMapId()));

	const areaColorByGameObjectName = createMemo<Map<string, () => { color: string; value: number | null }>>(() => {
		const theme = themeStore.currentTheme();
		const roomData = gameModule()?.map.rooms;
		if (!roomData) return new Map();

		return new Map<string, () => { color: string; value: number | null }>(
			roomData.map((room) => {
				const isSilk = isRoomDataSilk(room);
				return [
					room.gameObjectName,
					// oxlint-disable-next-line solid/reactivity
					createMemo(() => {
						let baseColor = room.origColor;

						if (isSilk && room.altColors) {
							for (const altColor of room.altColors) {
								if (roomDisplayStore.isConditionFulfilledSilkRoomDisplayMode(altColor.condition)) {
									baseColor = altColor.color;
									break;
								}
							}
						}

						return {
							color: theme === 'dark' ? baseColor.formatHex() : changeRoomColorForLightTheme(baseColor),
							value: null,
						};
					}),
				];
			}),
		);
	});

	const singleVarColorMap = createMemo(() => {
		const min = var1Min();
		let max = var1Max();
		if (min === max) {
			max = min + 1;
		}
		const curve = var1Curve();
		const theme = themeStore.currentTheme();
		const colorMap = singleVarColorMapType();
		return function (value: number | null) {
			if (value == null) return theme === 'dark' ? '#303030' : '#bbbbbb';

			const ratio = curve.transformTo01(value, min, max);
			if (theme === 'light') {
				return colorMap.getColorLight(ratio);
			} else {
				return colorMap.getColorDark(ratio);
			}
		};
	});

	function toVirtualSceneName(sceneName: string): string {
		return aggregationStore.getVirtualSceneNameForHeatMap(sceneName) ?? sceneName;
	}

	function getSingleVarColorForSceneName(sceneName: string): string | null {
		if (colorMode() !== '1-var') return null;
		const colorMap = singleVarColorMap();
		const aggregationValue = aggregationStore.getCurrentCorrectedAggregationValue(
			toVirtualSceneName(sceneName),
			var1(),
			true,
		);
		return colorMap(aggregationValue);
	}

	const singleVarColorByGameObjectName = createMemo(() => {
		const colorMap = singleVarColorMap();

		return new Map<string, () => { color: string; value: number | null }>(
			gameplayStore.gameModule()?.map.rooms.map((room) => {
				const aggregationValue = aggregationStore.getCurrentCorrectedAggregationValue(
					toVirtualSceneName(room.sceneName),
					var1(),
					true,
				);
				// const aggregationValue = getCorrectedAggregationValue().getAggregations(room.sceneName)?.[var1()] ?? 0;
				return [room.gameObjectName, () => ({ color: colorMap(aggregationValue), value: aggregationValue })];
			}),
		);
	});

	const selectedModeColorByGameObjectName = createMemo(() => {
		return colorMode() === 'area' ? areaColorByGameObjectName() : singleVarColorByGameObjectName()!;
	});

	function setRoomColorMode(roomColorMode: RoomColorMode) {
		setColorMode(roomColorMode);
	}
	function cycleRoomColorVar1(roomColorVar1: AggregationVariable) {
		batch(() => {
			if (var1() === roomColorVar1 && colorMode() === '1-var') {
				if (var1Curve().type === 'linear') {
					setVar1Curve(RoomColorCurveExponential.EXPONENT_2);
				} else {
					setRoomColorMode('area');
				}
			} else {
				setVar1(roomColorVar1);
				setVar1Curve(RoomColorCurveLinear);
				setRoomColorMode('1-var');
			}
		});
	}
	function setRoomColorVar1(roomColorVar1: AggregationVariable) {
		setVar1(roomColorVar1);
		if (colorMode() === 'area') {
			setRoomColorMode('1-var');
		}
	}
	function setRoomColorVar1Curve(roomColorVar1Curve: RoomColorCurve) {
		setVar1Curve(roomColorVar1Curve);
	}

	return {
		colorMode,
		var1,
		var1Curve,
		var1Min,
		var1Max,
		var1Delta,

		areaColorByGameObjectName,
		singleVarColorMap,
		selectedModeColorByGameObjectName,

		setRoomColorMode,
		cycleRoomColorVar1,
		setRoomColorVar1,
		setRoomColorVar1Curve,
		rangeMode,
		setRangeMode,

		singleVarColorMapId,
		setSingleVarColorMapId,

		getSingleVarColorForSceneName,

		reset,
	};
}

export type RoomColoringStore = ReturnType<typeof createRoomColoringStore>;
export const RoomColoringStoreContext = createContext<RoomColoringStore>();
export function useRoomColoringStore() {
	const store = useContext(RoomColoringStoreContext);
	if (!store) throw new Error('No RoomColoringStore in context!');
	return store;
}
