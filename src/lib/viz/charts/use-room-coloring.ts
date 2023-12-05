import * as d3 from 'd3';
import { useMemo } from 'react';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { assertNever } from '~/lib/utils';
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

    return useMemo(() => {
        function singleVarColormap(value: number) {
            const ratio = var1Max ? value / var1Max : 0;
            // return d3.interpolateRdPu(1 - ratio);
            // return d3.interpolateCool(ratio);
            return d3.color(d3.interpolateViridis(ratio))!.brighter(1).formatHex();
        }

        return {
            mode,
            var1,
            var1Max,
            aggregatedRunData,
            getRoomColor(r: RoomInfo) {
                if (mode === 'area' || alwaysUseAreaAsColor) {
                    return r.color.formatHex();
                } else if (mode === '1-var') {
                    return singleVarColormap(aggregatedRunData?.countPerScene?.[r.sceneName]?.[var1] ?? 0);
                } else {
                    assertNever(mode);
                }
            },
            singleVarColormap,
        };
    }, [mode, var1, alwaysUseAreaAsColor, aggregatedRunData?.countPerScene, var1Max]);
}
