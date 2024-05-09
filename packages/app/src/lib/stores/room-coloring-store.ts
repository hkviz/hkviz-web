import { roomData } from '@hkviz/parser';
import { changeRoomColorForLightTheme, roomColoringStore as roomColoringStoreSolid } from '@hkviz/viz';
import { computed } from '@preact/signals-react';
import * as d3 from 'd3';
import { themeStore } from '~/lib/stores/theme-store';
import { aggregationStore } from './aggregation-store';

const var1Max = computed(() => {
    const aggregatedRunData = aggregationStore.data.value;
    return aggregatedRunData?.maxOverScenes?.[roomColoringStoreSolid.var1.valuePreact] ?? 0;
});

const areaColorByGameObjectName = computed(() => {
    const theme = themeStore.currentTheme.valuePreact;

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
    const curve = roomColoringStoreSolid.var1Curve.valuePreact;
    const theme = themeStore.currentTheme.valuePreact;
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
            const var1 = roomColoringStoreSolid.var1.valuePreact;
            return [room.gameObjectName, colorMap(aggregatedRunData?.countPerScene?.[room.sceneName]?.[var1] ?? 0)];
        }),
    );
});

const selectedModeColorByGameObjectName = computed(() => {
    return roomColoringStoreSolid.colorMode.valuePreact === 'area'
        ? areaColorByGameObjectName.value
        : singleVarColorByGameObjectName.value;
});

export const roomColoringStore = {
    ...roomColoringStoreSolid,
    var1Max,

    areaColorByGameObjectName,
    singleVarColorMap,
    singleVarColorByGameObjectName,
    selectedModeColorByGameObjectName,
};
