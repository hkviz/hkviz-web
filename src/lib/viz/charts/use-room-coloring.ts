import * as d3 from 'd3';
import memoize from 'micro-memoize';
import { useMemo } from 'react';
import { useThemeStore } from '~/app/_components/theme-store';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { assertNever } from '~/lib/utils/utils';
import { type RoomInfo } from '../map-data/rooms';

function hslEquals(a: d3.HSLColor, b: d3.HSLColor) {
    return a.h === b.h && a.s === b.s && a.l === b.l;
}

export const darkenRoomColorForLightTheme = memoize(
    function darkenRoomColorForLightTheme(color: d3.HSLColor): string {
        return color.copy({ l: Math.max(color.l, 0.3) * 0.5, s: Math.max((color.s * 0.8) ** 0.8, 0.1) }).formatHsl();
    },
    {
        isEqual: hslEquals,
        maxSize: 1000,
    },
);

export const darkenRoomColorForDarkTheme = memoize(
    function darkenRoomColorForDarkTheme(color: d3.HSLColor): string {
        return color.copy({ l: color.l * 0.8, s: color.s * 0.75 }).formatHsl();
    },
    {
        isEqual: hslEquals,
        maxSize: 1000,
    },
);

console.log({ darkenRoomColorForLightTheme, darkenRoomColorForDarkTheme });

export function useRoomColoring({
    useViewOptionsStore,
    alwaysUseAreaAsColor = false,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    alwaysUseAreaAsColor?: boolean;
}) {
    const aggregatedRunData = useViewOptionsStore((state) => state.aggregatedRunData);
    const mode = useViewOptionsStore((state) => state.roomColorMode);
    const var1 = useViewOptionsStore((state) => state.roomColorVar1);
    const var1Curve = useViewOptionsStore((state) => state.roomColorVar1Curve);
    const var1Max = aggregatedRunData?.maxOverScenes?.[var1] ?? 0;

    const theme = useThemeStore((state) => state.theme);

    return useMemo(() => {
        function roomColorFromArea(r: RoomInfo) {
            const colorFromGame = r.color;
            if (theme === 'light') {
                return darkenRoomColorForLightTheme(colorFromGame);
            } else {
                return colorFromGame.formatHsl();
            }
        }

        function singleVarColormap(value: number) {
            const ratio = var1Curve.transformTo01(value, var1Max);
            if (theme === 'light') {
                const colorMapColor = d3.hsl(d3.interpolateCool(ratio));

                return colorMapColor.copy({ s: colorMapColor.s * 1.35, l: colorMapColor.l ** 0.7 * 0.75 }).formatHex();
            } else {
                const colorMapColor = d3.color(d3.interpolateViridis(ratio))!;
                return colorMapColor.brighter(1).formatHex();
            }
        }

        return {
            mode,
            var1,
            var1Max,
            var1Curve,
            aggregatedRunData,
            getRoomColor(r: RoomInfo) {
                if (mode === 'area' || alwaysUseAreaAsColor) {
                    return roomColorFromArea(r);
                } else if (mode === '1-var') {
                    return singleVarColormap(aggregatedRunData?.countPerScene?.[r.sceneName]?.[var1] ?? 0);
                } else {
                    assertNever(mode);
                }
            },
            singleVarColormap,
        };
    }, [mode, var1, var1Max, aggregatedRunData, theme, var1Curve, alwaysUseAreaAsColor]);
}
