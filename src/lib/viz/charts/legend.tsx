import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { useRoomColoring } from './use-room-coloring';
import { Card } from '@/components/ui/card';
import { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { aggregationVariableInfos, formatAggregatedVariableValue } from '../recording-files/run-aggregation-store';

const LEGEND_PADDING = 30;

export function MapLegend({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const svg = useRef<SVGSVGElement>(null);

    const roomColoring = useRoomColoring({ useViewOptionsStore });
    const var1Info = aggregationVariableInfos[roomColoring.var1];
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const var1SelectedRoomValue = selectedRoom
        ? roomColoring.aggregatedRunData?.countPerScene?.[selectedRoom]?.[roomColoring.var1] ?? 0
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
        console.log(steps);

        d3.select(svg.current)
            .append('g')
            .attr('data-group', 'tick-label')
            .selectAll('text')
            .data(steps)
            .enter()
            .append('text')
            .attr('class', 'text-white fill-current')
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
            .attr('class', 'text-white fill-current')
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
            .attr('class', 'text-white fill-current')
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
            .attr('class', 'text-white fill-current')
            .attr('transform', (d) => `translate(${tickX(d)}, 70)`);

        return () => {
            currentRoomTickG.remove();
        };
    }, [selectedRoom, tickX, var1SelectedRoomValue]);

    return (
        <Card className="absolute right-4 top-4 px-0 py-2 text-center" hidden={roomColoring.mode === 'area'}>
            {var1Info?.name ?? ''}
            <svg className="w-36" viewBox={`0 0 ${200 + LEGEND_PADDING * 2} 100`} ref={svg} />
        </Card>
    );
}
