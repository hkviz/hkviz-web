import { computed, signal } from '@preact/signals-react';
import * as d3 from 'd3';
import memoize from 'micro-memoize';
import { RoomColorCurveLinear, type RoomColorCurve } from '~/app/run/[id]/_room-color-curve';
import { themeStore } from '~/lib/stores/theme-store';
import { roomData } from '../viz/map-data/rooms';
import { type AggregationVariable } from '../viz/recording-files/run-aggregation-store';
import { aggregationStore } from './aggregation-store';

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
const mode = signal<RoomColorMode>('area');
const var1 = signal<AggregationVariable>('firstVisitMs');
const var1Curve = signal<RoomColorCurve>(RoomColorCurveLinear);

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
    return mode.value === 'area' ? areaColorByGameObjectName.value : singleVarColorByGameObjectName.value;
});

export const roomColoringStore = {
    mode,
    var1,
    var1Curve,
    var1Max,

    areaColorByGameObjectName,
    singleVarColorMap,
    singleVarColorByGameObjectName,
    selectedModeColorByGameObjectName,
};
