import * as d3 from 'd3';
import { useMemo } from 'react';
import { useThemeStore } from '~/app/_components/theme-store';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { assertNever } from '~/lib/utils/utils';
import { type RoomInfo } from '../map-data/rooms';

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
    const var1Max = aggregatedRunData?.maxOverScenes?.[var1] ?? 0;

    const theme = useThemeStore((state) => state.theme);

    return useMemo(() => {
        function roomColorFromArea(r: RoomInfo) {
            const colorFromGame = r.color;
            if (theme === 'light') {
                return colorFromGame.copy({ l: colorFromGame.l * 0.5, s: colorFromGame.s * 0.5 }).formatHsl();
            } else {
                return colorFromGame.formatHsl();
            }
        }

        function singleVarColormap(value: number) {
            const ratio = var1Max ? value / var1Max : 0;
            const colorMapColor = d3.color(d3.interpolateViridis(ratio))!;
            if (theme === 'light') {
                return colorMapColor.darker(0.5).formatHex();
            } else {
                return colorMapColor.brighter(1).formatHex();
            }
        }

        return {
            mode,
            var1,
            var1Max,
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
    }, [mode, var1, alwaysUseAreaAsColor, aggregatedRunData, var1Max, theme]);
}
