import * as d3 from 'd3';
import memoize from 'micro-memoize';
import { RoomColorCurveExponential, RoomColorCurveLinear, type RoomColorCurve } from '../color-curves';
import { themeStore } from './theme-store';
import { roomData } from '@hkviz/parser';
import { aggregationStore, type AggregationVariable } from './aggregation-store';
import { uiStore } from './ui-store';
import { batch, createSignal } from '../preact-solid-combat';
import { createMemo } from 'solid-js';

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
const [colorMode, setColorMode] = createSignal<RoomColorMode>('area');
const [var1, setVar1] = createSignal<AggregationVariable>('firstVisitMs');
const [var1Curve, setVar1Curve] = createSignal<RoomColorCurve>(RoomColorCurveLinear);

function reset() {
    setColorMode('area');
    setVar1('firstVisitMs');
    setVar1Curve(RoomColorCurveLinear);
}

const var1Max = createMemo(() => {
    const aggregatedRunData = aggregationStore.data();
    return aggregatedRunData?.maxOverScenes?.[var1()] ?? 0;
});

const areaColorByGameObjectName = createMemo(() => {
    const theme = themeStore.currentTheme();

    return new Map<string, string>(
        roomData.map((room) => {
            return [
                room.gameObjectName,
                theme === 'dark' ? room.color.formatHex() : changeRoomColorForLightTheme(room.color),
            ];
        }),
    );
});

const singleVarColorMap = createMemo(() => {
    const max = var1Max();
    const curve = var1Curve();
    const theme = themeStore.currentTheme();
    return function (value: number) {
        const ratio = curve.transformTo01(value, max);
        if (theme === 'light') {
            const colorMapColor = d3.hsl(d3.interpolateCool(ratio));

            return colorMapColor.copy({ s: colorMapColor.s * 1.35, l: colorMapColor.l ** 0.7 * 0.75 }).formatHex();
        } else {
            const colorMapColor = d3.color(d3.interpolateViridis(ratio))!;
            return colorMapColor.brighter(1).formatHex();
        }
    };
});

const singleVarColorByGameObjectName = createMemo(() => {
    const aggregatedRunData = aggregationStore.data();
    const colorMap = singleVarColorMap();

    return new Map<string, string>(
        roomData.map((room) => {
            return [room.gameObjectName, colorMap(aggregatedRunData?.countPerScene?.[room.sceneName]?.[var1()] ?? 0)];
        }),
    );
});

const selectedModeColorByGameObjectName = createMemo(() => {
    return colorMode() === 'area' ? areaColorByGameObjectName() : singleVarColorByGameObjectName();
});

function setRoomColorMode(roomColorMode: RoomColorMode) {
    setColorMode(roomColorMode);
}
function cycleRoomColorVar1(roomColorVar1: AggregationVariable) {
    batch(() => {
        if (var1() === roomColorVar1 && colorMode() === '1-var') {
            if (var1Curve().type === 'linear' && !uiStore.isV1()) {
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

export const roomColoringStore = {
    colorMode,
    var1,
    var1Curve,
    var1Max,

    areaColorByGameObjectName,
    singleVarColorMap,
    singleVarColorByGameObjectName,
    selectedModeColorByGameObjectName,

    setRoomColorMode,
    cycleRoomColorVar1,
    setRoomColorVar1,
    setRoomColorVar1Curve,

    reset,
};
