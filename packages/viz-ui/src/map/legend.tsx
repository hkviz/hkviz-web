import { Card } from '@hkviz/components';
import {
    aggregationStore,
    aggregationVariableInfos,
    formatAggregatedVariableValue,
    roomColoringStore,
    roomDisplayStore,
    uiStore,
} from '@hkviz/viz';
import * as d3 from 'd3';
import { Show, createEffect, createSignal, onCleanup, type Component } from 'solid-js';
import { RoomColorCurveSelect } from '../room-infos/room-color-curve-menu';

const LEGEND_PADDING = 30;

const LEGEND_SVG_TEXT_CLASSES = 'text-black dark:text-white fill-current';

export const MapLegend: Component = () => {
    const [svg, setSvg] = createSignal<SVGSVGElement>();

    const isV1 = uiStore.isV1;
    const var1 = roomColoringStore.var1;
    const mode = roomColoringStore.colorMode;
    const var1Info = () => aggregationVariableInfos[var1()];
    const hoveredRoom = roomDisplayStore.hoveredSceneName;
    const var1SelectedRoomValue = () =>
        hoveredRoom() ? aggregationStore.data()?.countPerScene?.[hoveredRoom()!]?.[var1()] ?? 0 : null;
    const var1Max = roomColoringStore.var1Max;
    const singleVarColormap = roomColoringStore.singleVarColorMap;

    const tickX = (d: number) => {
        return (d / var1Max()) * 200 + LEGEND_PADDING;
    };

    createEffect(() => {
        const _svg = svg();
        if (!_svg) return;
        d3.select(_svg).selectAll('*').remove();

        // color-ramp
        const data = d3.range(200).map((i) => Math.round((var1Max() * i) / 200));
        d3.select(_svg)
            .append('g')
            .attr('data-group', 'ramp')
            .selectAll('rect')
            .data(data)
            .enter()
            .append('svg:rect')
            .attr('fill', (d) => singleVarColormap()(d))
            .attr('stroke', 'none')
            .attr('y', 40)
            .attr('x', (_d, i) => i + LEGEND_PADDING)
            .attr('width', 2)
            .attr('height', 20);

        // ticks static based on variable max
        const steps = [...new Set(d3.range(0, var1Max() + 0.0001, var1Max() / 3).map((d) => Math.round(d)))].sort(
            (a, b) => a - b,
        );

        d3.select(_svg)
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
            .text((d) => formatAggregatedVariableValue(var1(), d));

        const triangle = d3.symbol().size(30).type(d3.symbolTriangle);
        d3.select(_svg)
            .append('g')
            .attr('data-group', 'tick-pointer')
            .selectAll('path')
            .data(steps)
            .enter()
            .append('path')
            .attr('d', triangle)
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('transform', (d) => `translate(${tickX(d)}, 30) rotate(180)`);
    });

    createEffect(() => {
        const _var1SelectedRoomValue = var1SelectedRoomValue();
        const _svg = svg();
        if (!_svg || _var1SelectedRoomValue == null) return;

        const currentRoomTickG = d3.select(_svg).append('g').attr('data-group', 'tick-current-room');

        currentRoomTickG
            .selectAll('text')
            .data([_var1SelectedRoomValue])
            .enter()
            .append('text')
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('stroke', 'none')
            .attr('y', 90)
            .attr('x', tickX)
            .style('text-anchor', 'middle')
            .attr('width', 2)
            .attr('height', 20)
            .text((d) => formatAggregatedVariableValue(var1(), d));

        const triangle = d3.symbol().size(30).type(d3.symbolTriangle);
        currentRoomTickG
            .append('g')
            .attr('data-group', 'tick-pointer')
            .selectAll('path')
            .data([_var1SelectedRoomValue])
            .enter()
            .append('path')
            .attr('d', triangle)
            .attr('class', LEGEND_SVG_TEXT_CLASSES)
            .attr('transform', (d) => `translate(${tickX(d)}, 70)`);

        onCleanup(() => {
            currentRoomTickG.remove();
        });
    });

    return (
        <Card class="pt-1 text-center" hidden={mode() === 'area'}>
            <div class="flex flex-col items-center justify-center gap-1">
                <div class="flex flex-row items-center justify-center gap-1 px-1">
                    <div class="pl-1 text-sm">{var1Info()?.name ?? ''} </div>
                    <Show when={!isV1()}>
                        <RoomColorCurveSelect variable={var1()} />
                    </Show>
                </div>
                <svg class="w-36" viewBox={`0 0 ${200 + LEGEND_PADDING * 2} 100`} ref={setSvg} />
            </div>
        </Card>
    );
};
