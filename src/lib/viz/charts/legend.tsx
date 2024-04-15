import { Card } from '@/components/ui/card';
import { useSignals } from '@preact/signals-react/runtime';
import * as d3 from 'd3';
import { useCallback, useEffect, useRef } from 'react';
import { RoomColorCurveSelect } from '~/app/run/[id]/_room-color-curve-menu';
import { aggregationStore } from '~/lib/client-stage/aggregation-store';
import { roomColoringStore } from '~/lib/client-stage/room-coloring-store';
import { roomDisplayStore } from '~/lib/client-stage/room-display-store';
import { type UseViewOptionsStore } from '~/lib/client-stage/view-options-store';
import { aggregationVariableInfos, formatAggregatedVariableValue } from '../recording-files/run-aggregation-store';

const LEGEND_PADDING = 30;

const LEGEND_SVG_TEXT_CLASSES = 'text-black dark:text-white fill-current';

export function MapLegend({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    useSignals();
    const svg = useRef<SVGSVGElement>(null);

    const isV1 = useViewOptionsStore((s) => s.isV1());
    const var1 = roomColoringStore.var1.value;
    const mode = roomColoringStore.mode.value;
    const var1Info = aggregationVariableInfos[var1];
    const hoveredRoom = roomDisplayStore.hoveredSceneName.value;
    const var1SelectedRoomValue = hoveredRoom
        ? aggregationStore.data.value?.countPerScene?.[hoveredRoom]?.[var1] ?? 0
        : null;
    const var1Max = roomColoringStore.var1Max.value;
    const singleVarColormap = roomColoringStore.singleVarColorMap.value;

    const tickX = useCallback(
        (d: number) => {
            return (d / var1Max) * 200 + LEGEND_PADDING;
        },
        [var1Max],
    );

    useEffect(() => {
        if (!svg.current) return;
        d3.select(svg.current).selectAll('*').remove();

        // color-ramp
        const data = d3.range(200).map((i) => Math.round((var1Max * i) / 200));
        d3.select(svg.current)
            .append('g')
            .attr('data-group', 'ramp')
            .selectAll('rect')
            .data(data)
            .enter()
            .append('svg:rect')
            .attr('fill', (d) => singleVarColormap(d))
            .attr('stroke', 'none')
            .attr('y', 40)
            .attr('x', (d, i) => i + LEGEND_PADDING)
            .attr('width', 2)
            .attr('height', 20);

        // ticks static based on variable max
        const steps = [...new Set(d3.range(0, var1Max + 0.0001, var1Max / 3).map((d) => Math.round(d)))].sort(
            (a, b) => a - b,
        );

        d3.select(svg.current)
            .append('g')
            .attr('data-group', 'tick-label')
            .selectAll('text')
            .data(steps)
            .enter()
            .append('text')
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('stroke', 'none')
            .attr('y', 20)
            .attr('x', tickX)
            .style('text-anchor', 'middle')
            .attr('width', 2)
            .attr('height', 20)
            .text((d) => formatAggregatedVariableValue(var1, d));

        const triangle = d3.symbol().size(30).type(d3.symbolTriangle);
        d3.select(svg.current)
            .append('g')
            .attr('data-group', 'tick-pointer')
            .selectAll('path')
            .data(steps)
            .enter()
            .append('path')
            .attr('d', triangle)
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('transform', (d) => `translate(${tickX(d)}, 30) rotate(180)`);
    }, [var1Max, var1, tickX, singleVarColormap]);

    useEffect(() => {
        if (!svg.current || var1SelectedRoomValue == null) return;

        const currentRoomTickG = d3.select(svg.current).append('g').attr('data-group', 'tick-current-room');

        currentRoomTickG
            .selectAll('text')
            .data([var1SelectedRoomValue])
            .enter()
            .append('text')
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('stroke', 'none')
            .attr('y', 90)
            .attr('x', tickX)
            .style('text-anchor', 'middle')
            .attr('width', 2)
            .attr('height', 20)
            .text((d) => formatAggregatedVariableValue(var1, d));

        const triangle = d3.symbol().size(30).type(d3.symbolTriangle);
        currentRoomTickG
            .append('g')
            .attr('data-group', 'tick-pointer')
            .selectAll('path')
            .data([var1SelectedRoomValue])
            .enter()
            .append('path')
            .attr('d', triangle)
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('transform', (d) => `translate(${tickX(d)}, 70)`);

        return () => {
            currentRoomTickG.remove();
        };
    }, [hoveredRoom, var1, tickX, var1SelectedRoomValue]);

    return (
        <Card className="text-center" hidden={mode === 'area'}>
            <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex flex-row items-center justify-center gap-1 px-2">
                    <div className="text-sm">{var1Info?.name ?? ''} </div>
                    {!isV1 && <RoomColorCurveSelect useViewOptionsStore={useViewOptionsStore} variable={var1} />}
                </div>
                <svg className="w-36" viewBox={`0 0 ${200 + LEGEND_PADDING * 2} 100`} ref={svg} />
            </div>
        </Card>
    );
}
