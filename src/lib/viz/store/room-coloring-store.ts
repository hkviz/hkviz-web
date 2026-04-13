import * as d3 from 'd3';
import { memoize } from 'micro-memoize';
import { batch, createContext, createMemo, createSignal, useContext } from 'solid-js';
import { AggregationVariableAny } from '~/lib/aggregation/aggregation-value-specific';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { mapRoomsHollow } from '../../parser';
import { RoomColorCurveExponential, RoomColorCurveLinear, type RoomColorCurve } from '../color-curves';
import { ColorMapId, getRoomColorMapById } from '../color-map';
import { AggregationStore } from './aggregation-store';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';
import { RoomDisplayStore } from './room-display-store';
import { ThemeStore } from './theme-store';

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

export function createRoomColoringStore(
	themeStore: ThemeStore,
	roomDisplayStore: RoomDisplayStore,
	aggregationStore: AggregationStore,
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

	function reset() {
		setColorMode('area');
		setVar1('damageTaken' satisfies AggregationVariableAny as AggregationVariable);
		setVar1Curve(RoomColorCurveLinear);
		setSingleVarColorMapId('viridis-cool');
	}

	const var1Max = createMemo(() => {
		const aggregatedRunData = gameplayStore.recording()?.aggregations;
		const areaSelectionMode = roomDisplayStore.areaSelectionMode();
		const maxMode = areaSelectionMode === 'zone' ? 'overZones' : 'overScenes';
		const value = aggregatedRunData?.maxPerMode[maxMode]?.getValue(var1());
		return value ?? 0;
	});

	const singleVarColorMapType = createMemo(() => getRoomColorMapById(singleVarColorMapId()));

	const areaColorByGameObjectName = createMemo(() => {
		const theme = themeStore.currentTheme();
		const roomData = gameModule()?.mapRooms;
		if (!roomData) return new Map<string, string>();

		return new Map<string, string>(
			roomData.map((room) => {
				return [
					room.gameObjectName,
					theme === 'dark' ? room.origColor.formatHex() : changeRoomColorForLightTheme(room.origColor),
				];
			}),
		);
	});

	const singleVarColorMap = createMemo(() => {
		const max = var1Max();
		const curve = var1Curve();
		const theme = themeStore.currentTheme();
		const colorMap = singleVarColorMapType();
		return function (value: number | null) {
			if (value === null) return theme === 'dark' ? '#303030' : '#bbbbbb';

			const ratio = curve.transformTo01(value, max);
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
		const aggregations = aggregationStore.getAggregations(toVirtualSceneName(sceneName));
		const aggregationValue = aggregationStore.getCorrectedAggregationValueNullIfUnvisited(
			aggregations,
			var1(),
			animationStore.msIntoGame,
		);
		return colorMap(aggregationValue);
	}

	const singleVarColorByGameObjectName = createMemo(() => {
		if (colorMode() !== '1-var') return null;
		const colorMap = singleVarColorMap();

		return new Map<string, string>(
			mapRoomsHollow.map((room) => {
				const aggregations = aggregationStore.getAggregations(toVirtualSceneName(room.sceneName));
				const aggregationValue = aggregationStore.getCorrectedAggregationValueNullIfUnvisited(
					aggregations,
					var1(),
					animationStore.msIntoGame,
				);
				// const aggregationValue = getCorrectedAggregationValue().getAggregations(room.sceneName)?.[var1()] ?? 0;
				return [room.gameObjectName, colorMap(aggregationValue)];
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
		var1Max,

		areaColorByGameObjectName,
		singleVarColorMap,
		selectedModeColorByGameObjectName,

		setRoomColorMode,
		cycleRoomColorVar1,
		setRoomColorVar1,
		setRoomColorVar1Curve,

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
