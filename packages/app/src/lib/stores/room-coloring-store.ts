import { batch, computed, signal } from '@preact/signals-react';
import * as d3 from 'd3';
import memoize from 'micro-memoize';
import { RoomColorCurveExponential, RoomColorCurveLinear, type RoomColorCurve } from '~/app/run/[id]/_room-color-curve';
import { themeStore } from '~/lib/stores/theme-store';
import { asReadonlySignal } from '../utils/signals';
import { roomData } from '@hkviz/parser';
import { aggregationStore, type AggregationVariable } from './aggregation-store';
import { uiStore } from './ui-store';

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
const colorMode = signal<RoomColorMode>('area');
const var1 = signal<AggregationVariable>('firstVisitMs');
const var1Curve = signal<RoomColorCurve>(RoomColorCurveLinear);

function reset() {
    colorMode.value = 'area';
    var1.value = 'firstVisitMs';
    var1Curve.value = RoomColorCurveLinear;
}

const var1Max = computed(() => {
    const aggregatedRunData = aggregationStore.data.value;
    return aggregatedRunData?.maxOverScenes?.[var1.value] ?? 0;
});

const areaColorByGameObjectName = computed(() => {
    const theme = themeStore.currentTheme.value;

    return new Map<string, string>(
        roomData.map((room) => {
            return [
                room.gameObjectName,
                theme === 'dark' ? room.color.formatHex() : changeRoomColorForLightTheme(room.color),
            ];
        }),
    );
});

const singleVarColorMap = computed(() => {
    const max = var1Max.value;
    const curve = var1Curve.value;
    const theme = themeStore.currentTheme.value;
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

const singleVarColorByGameObjectName = computed(() => {
    const aggregatedRunData = aggregationStore.data.value;
    const colorMap = singleVarColorMap.value;

    return new Map<string, string>(
        roomData.map((room) => {
            return [
                room.gameObjectName,
                colorMap(aggregatedRunData?.countPerScene?.[room.sceneName]?.[var1.value] ?? 0),
            ];
        }),
    );
});

const selectedModeColorByGameObjectName = computed(() => {
    return colorMode.value === 'area' ? areaColorByGameObjectName.value : singleVarColorByGameObjectName.value;
});

function setRoomColorMode(roomColorMode: RoomColorMode) {
    colorMode.value = roomColorMode;
}
function cycleRoomColorVar1(roomColorVar1: AggregationVariable) {
    batch(() => {
        if (var1.value === roomColorVar1 && colorMode.value === '1-var') {
            if (var1Curve.value.type === 'linear' && !uiStore.isV1.value) {
                var1Curve.value = RoomColorCurveExponential.EXPONENT_2;
            } else {
                setRoomColorMode('area');
            }
        } else {
            var1.value = roomColorVar1;
            var1Curve.value = RoomColorCurveLinear;
            setRoomColorMode('1-var');
        }
    });
}
function setRoomColorVar1(roomColorVar1: AggregationVariable) {
    var1.value = roomColorVar1;
    if (colorMode.value === 'area') {
        setRoomColorMode('1-var');
    }
}
function setRoomColorVar1Curve(roomColorVar1Curve: RoomColorCurve) {
    var1Curve.value = roomColorVar1Curve;
}

export const roomColoringStore = {
    colorMode: asReadonlySignal(colorMode),
    var1: asReadonlySignal(var1),
    var1Curve: asReadonlySignal(var1Curve),
    var1Max: asReadonlySignal(var1Max),

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
