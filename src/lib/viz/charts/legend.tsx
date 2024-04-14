import { Card } from '@/components/ui/card';
import * as d3 from 'd3';
import { useCallback, useEffect, useRef } from 'react';
import { RoomColorCurveSelect } from '~/app/run/[id]/_room-color-curve-menu';
import { type UseViewOptionsStore } from '~/lib/client-stage/view-options-store';
import { aggregationVariableInfos, formatAggregatedVariableValue } from '../recording-files/run-aggregation-store';
import { useRoomColoring } from './use-room-coloring';

const LEGEND_PADDING = 30;

const LEGEND_SVG_TEXT_CLASSES = 'text-black dark:text-white fill-current';

export function MapLegend({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const svg = useRef<SVGSVGElement>(null);

    const isV1 = useViewOptionsStore((s) => s.isV1());
    const roomColoring = useRoomColoring({ useViewOptionsStore });
    const var1Info = aggregationVariableInfos[roomColoring.var1];
    const hoveredRoom = useViewOptionsStore((s) => s.hoveredRoom);
    const var1SelectedRoomValue = hoveredRoom
        ? roomColoring.aggregatedRunData?.countPerScene?.[hoveredRoom]?.[roomColoring.var1] ?? 0
        : null;

    const tickX = useCallback(
        (d: number) => {
            return (d / roomColoring.var1Max) * 200 + LEGEND_PADDING;
        },
        [roomColoring],
    );

    useEffect(() => {
        if (!svg.current) return;
        d3.select(svg.current).selectAll('*').remove();

        // color-ramp
        const data = d3.range(200).map((i) => Math.round((roomColoring.var1Max * i) / 200));
        d3.select(svg.current)
            .append('g')
            .attr('data-group', 'ramp')
            .selectAll('rect')
            .data(data)
            .enter()
            .append('svg:rect')
            .attr('fill', (d) => roomColoring.singleVarColormap(d))
            .attr('stroke', 'none')
            .attr('y', 40)
            .attr('x', (d, i) => i + LEGEND_PADDING)
            .attr('width', 2)
            .attr('height', 20);

        // ticks static based on variable max
        const steps = [
            ...new Set(d3.range(0, roomColoring.var1Max + 0.0001, roomColoring.var1Max / 3).map((d) => Math.round(d))),
        ].sort((a, b) => a - b);

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
            .text((d) => formatAggregatedVariableValue(roomColoring.var1, d));

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
    }, [roomColoring, tickX]);

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
            .text((d) => formatAggregatedVariableValue(roomColoring.var1, d));

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
    }, [hoveredRoom, roomColoring.var1, tickX, var1SelectedRoomValue]);

    return (
        <Card className="text-center" hidden={roomColoring.mode === 'area'}>
            <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex flex-row items-center justify-center gap-1 px-2">
                    <div className="text-sm">{var1Info?.name ?? ''} </div>
                    {!isV1 && (
                        <RoomColorCurveSelect useViewOptionsStore={useViewOptionsStore} variable={roomColoring.var1} />
                    )}
                </div>
                <svg className="w-36" viewBox={`0 0 ${200 + LEGEND_PADDING * 2} 100`} ref={svg} />
            </div>
        </Card>
    );
}
