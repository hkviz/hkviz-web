'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { type ReadonlySignal } from '@preact/signals-react';
import { useComputed, useSignal, useSignalEffect, useSignals } from '@preact/signals-react/runtime';
import * as d3 from 'd3';
import { type D3BrushEvent } from 'd3-brush';
import { memo, useId, useMemo, useRef } from 'react';
import useEvent from 'react-use-event-hook';
import { animationStore } from '~/lib/stores/animation-store';
import { extraChartStore } from '~/lib/stores/extra-chart-store';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { hoverMsStore } from '~/lib/stores/hover-ms-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { uiStore } from '~/lib/stores/ui-store';
import { d3Ticks, isFilledD3Selection } from '~/lib/utils/d3';
import { signalRef } from '~/lib/utils/signal-ref';
import { formatTimeMs } from '~/lib/utils/time';
import { useIsVisibleSignal } from '~/lib/utils/use-is-visible';
import { type FrameEndEvent, type FrameEndEventNumberKey } from '~/lib/viz/recording-files/events/frame-end-event';
import { type ColorClasses } from './colors';
import { downScale } from './down-scale';

export type LineChartVariableDescription = {
    key: FrameEndEventNumberKey;
    name: string;
    description: string;
    UnitIcon: React.FunctionComponent<{ className?: string }>;
    order: number;
    color: ColorClasses;
} & (
    | {
          notShownInGraph: true;
      }
    | {
          defaultHidden?: true;
      }
);

export type LineChartShownVariableDescription = Exclude<LineChartVariableDescription, { notShownInGraph: true }>;

function isShownInGraph(it: LineChartVariableDescription): it is LineChartShownVariableDescription {
    return !('notShownInGraph' in it && it.notShownInGraph === true);
}

export interface LineAreaChartProps {
    variables: LineChartVariableDescription[];
    yAxisLabel: string;
    header: React.ReactNode;
    minimalMaximumY: number;
    downScaleMaxTimeDelta: number;
    renderScale?: number;
}

export const LineAreaChart = memo(function LineAreaChart({
    variables,
    yAxisLabel,
    header,
    minimalMaximumY,
    downScaleMaxTimeDelta,
    renderScale = 10,
}: LineAreaChartProps) {
    useSignals();
    const variablesPerKey = useMemo(() => {
        return Object.fromEntries(variables.map((it) => [it.key, it] as const));
    }, [variables]);

    const svgSignal = useSignal<SVGSVGElement | null>(null);

    const isV1 = uiStore.isV1.value;

    const isVisible = useIsVisibleSignal(svgSignal);

    const previousTimeBounds = useSignal([0, 0] as readonly [number, number]);
    const debouncedTimeBounds = useComputed<readonly [number, number]>(() => {
        if (!isVisible.value) return previousTimeBounds.peek();
        const bounds = extraChartStore.debouncedTimeBounds.value;
        previousTimeBounds.value = bounds;
        return bounds;
    });
    const previousMsIntoGame = useSignal(0);
    const debouncedMsIntoGame = useComputed<number>(() => {
        if (!isVisible.value) return previousMsIntoGame.peek();
        const ms = extraChartStore.debouncedMsIntoGame.value;
        previousMsIntoGame.value = ms;
        return ms;
    });

    const selectedVars = useSignal<FrameEndEventNumberKey[]>(
        variables
            .filter(isShownInGraph)
            .filter((it) => !it.defaultHidden)
            .toSorted((a, b) => a.order - b.order)
            .map((it) => it.key),
    );

    function onVariableCheckedChange(key: FrameEndEventNumberKey, checked: boolean) {
        const prev = selectedVars.value;
        if (checked) {
            selectedVars.value = [...prev, key].sort((a, b) => variablesPerKey[a]!.order - variablesPerKey[b]!.order);
        } else {
            selectedVars.value = prev.filter((it) => it !== key);
        }
    }

    const id = useId();

    const data = useComputed(() => {
        const recording = gameplayStore.recording.value;
        if (!recording) return [];
        const togetherEvents = downScale(
            recording.frameEndEvents,
            variables.map((it) => it.key),
            downScaleMaxTimeDelta,
        );
        return togetherEvents;
    });

    type Datum = FrameEndEvent;
    type Series = {
        data: Datum;
        0: number;
        1: number;
    }[] & { key: string; index: number };

    const widthWithMargin = 400 * renderScale;
    const heightWithMargin = 300 * renderScale;
    const marginTop = 25 * renderScale;
    const marginRight = 10 * renderScale;
    const marginBottom = 35 * renderScale;
    const marginLeft = 45 * renderScale;
    const height = heightWithMargin - marginTop - marginBottom;
    const width = widthWithMargin - marginLeft - marginRight;

    // Determine the series that need to be stacked.
    const series = useComputed(() => {
        const _data = data.value;
        const _selectedVars = selectedVars.value;
        return d3.stack<Datum>().keys(
            _selectedVars.length === 0
                ? variables
                      .filter(isShownInGraph)
                      .toSorted((a, b) => a.order - b.order)
                      .map((it) => it.key)
                : _selectedVars,
        )(_data) as unknown as Series[];
    });

    const x = useComputed(() => {
        return d3.scaleLinear().domain(debouncedTimeBounds.value).range([0, width]);
    });

    const xNotAnimated = useComputed(() => {
        return d3
            .scaleLinear()
            .domain([gameplayStore.timeFrame.value.min, gameplayStore.timeFrame.value.max])
            .range([0, width]);
    });

    const maxYOverAllTime = useComputed(() => {
        return Math.max(d3.max(series.value.at(-1)!, (d) => d[1]) ?? minimalMaximumY, minimalMaximumY);
    });

    // todo sub to series
    const maxYInSelection = useComputed(() => {
        if (isV1) return maxYOverAllTime.value;
        const _series = series.value;
        const _debouncedTimeBounds = debouncedTimeBounds.value;
        const s = _series.at(-1)!;
        const minMsIntoGame = _debouncedTimeBounds[0];
        const maxMsIntoGame = _debouncedTimeBounds[1];
        const max =
            d3.max(s, (d, i) => {
                const dMsIntoGame = d.data.msIntoGame;
                const dNextMsIntoGame = s[i + 1]?.data.msIntoGame ?? dMsIntoGame;
                function isInRange(msIntoGame: number | null) {
                    if (msIntoGame == null) return false;
                    return msIntoGame >= minMsIntoGame && msIntoGame <= maxMsIntoGame;
                }
                const isInRangeOrClose =
                    isInRange(dMsIntoGame) ||
                    (dMsIntoGame < minMsIntoGame && (dNextMsIntoGame > maxMsIntoGame || i === s.length - 1));

                return isInRangeOrClose ? d[1] : 0;
            }) ?? 0;
        return Math.max(max * 1.05, minimalMaximumY);
    });

    const y = useComputed(() => {
        return d3
            .scaleLinear()
            .domain([0, maxYOverAllTime.value] as [number, number])
            .rangeRound([height, 0]);
    });

    const yInSelection = useComputed(() => {
        return d3
            .scaleLinear()
            .domain([0, maxYInSelection.value] as [number, number])
            .rangeRound([height, 0]);
    });

    const skipNextUpdate = useRef(false);
    const onBrushEnd = useEvent((event: D3BrushEvent<unknown>) => {
        const selection = (event.selection ?? null) as [number, number] | null;

        if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
        }

        if (selection == null) {
            extraChartStore.resetTimeBounds();
        } else {
            const invSelection = [x.value.invert(selection[0]), x.value.invert(selection[1])] as const;
            extraChartStore.setTimeBoundsStopFollowIfOutside(invSelection);
        }
        // todo animate axis
        skipNextUpdate.current = true;
        svgParts.value.brush!.move(svgParts.value.brushG!, null);
    });

    const svgParts = useComputed(function lineAreaChartMainSetup() {
        const _recording = gameplayStore.recording.value;
        if (!_recording) {
            return {
                areaPaths: null,
                xAxis: null,
                yAxis: null,
                brush: null,
                brushG: null,
                animationLine: null,
            };
        }
        const svg = d3.select(svgSignal.value);

        svg.selectAll('*').remove();

        svg.append('text')
            .attr('x', marginLeft - 10 * renderScale)
            .attr('y', 14 * renderScale)
            .attr('text-anchor', 'end')
            .attr('class', 'text-foreground fill-current')
            .attr('font-size', 10 * renderScale)
            .text(yAxisLabel);

        // Append the horizontal axis atop the area.
        svg.append('text')
            .attr('x', widthWithMargin / 2)
            .attr('y', heightWithMargin - 2 * renderScale)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-foreground fill-current')
            .attr('font-size', 10 * renderScale)
            .text('Time');

        // brush
        const rootG = svg.append('g').attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');
        rootG
            .append('defs')
            .append('svg:clipPath')
            .attr('id', id + 'clip')
            .append('svg:rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', 0)
            .attr('y', 0);

        const areaPaths = rootG
            .append('g')
            .attr('clip-path', `url(#${id}clip)`)
            .selectAll()
            .data(series.value)
            .join('path')
            .attr('transform-origin', '0 80%')
            .attr('class', (d) => variablesPerKey[d.key]?.color?.path ?? '');
        areaPaths.append('title').text((d) => d.key);

        // axis x
        const xAxis = rootG.append('g').attr('transform', `translate(0,${height})`);

        // axis y
        const yAxis = rootG.append('g');

        function mouseToMsIntoGame(e: MouseEvent) {
            const extraChartsTimeBounds = extraChartStore.timeBounds.peek();
            const rect = brushG.node()!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            return Math.round(
                extraChartsTimeBounds[0] + (extraChartsTimeBounds[1] - extraChartsTimeBounds[0]) * (x / rect.width),
            );
        }
        function sceneFromMs(ms: number) {
            if (!_recording) return null;
            return _recording.sceneEventFromMs(ms);
        }

        // brush
        const brush = d3
            .brushX()
            .extent([
                [0, 0],
                [width, height],
            ])
            .filter((e) => !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey)
            .on('end', onBrushEnd);
        const brushG = rootG
            .append('g')
            .attr('class', 'brush')
            .on('mousemove', (e) => {
                if (isV1) return;
                const ms = mouseToMsIntoGame(e);
                hoverMsStore.setHoveredMsIntoGame(ms);
                const scene = sceneFromMs(ms)?.getMainVirtualSceneName();
                if (scene) {
                    roomDisplayStore.setHoveredRoom(scene);
                    roomDisplayStore.setSelectedRoomIfNotPinned(scene);
                }
            })
            .on('mouseleave', () => {
                if (isV1) return;
                hoverMsStore.setHoveredMsIntoGame(null);
                roomDisplayStore.setHoveredRoom(null);
            })
            .on('click', (e) => {
                if (isV1) return;
                if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                    const ms = mouseToMsIntoGame(e);
                    animationStore.setMsIntoGame(ms);
                    const scene = sceneFromMs(ms)?.getMainVirtualSceneName();
                    if (scene) {
                        roomDisplayStore.setSelectedRoom(scene);
                    }
                }
            });
        brushG.call(brush);

        // animationLine
        const animationLine = rootG
            .append('line')
            .attr('class', 'stroke-current text-foreground')
            .attr('stroke-width', 2 * renderScale)
            .attr('stroke-dasharray', `${renderScale * 3} ${renderScale * 3}`)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height);

        return {
            areaPaths,
            xAxis,
            yAxis,
            brush,
            brushG,
            animationLine,
        };
    });

    // update area
    useSignalEffect(function lineAreaChartUpdateAreaEffect() {
        const { areaPaths } = svgParts.value;
        if (!isFilledD3Selection(areaPaths)) return;
        const _y = y.value;

        // Construct an area shape.
        const area = d3
            .area<Series[number]>()
            .x((d) => {
                return xNotAnimated.value(d.data?.msIntoGame ?? 0);
            })
            .y0((d) => _y(d[0]))
            .y1((d) => _y(d[1]))
            .curve(d3.curveStepAfter);

        // areaPaths.value.transition().ease(d3.easeLinear).duration(extraChartStore.transitionDuration).attr('d', area);
        areaPaths.attr('d', area);
        //areaPaths.current.attr('d', area);

        // areaPaths.current.attr('d', area);
        // }, [mainEffectChanges, recording, width, x, y]);
    });

    // update area movement
    useSignalEffect(function lineAreaChartMoveAreaEffect() {
        const { areaPaths } = svgParts.value;
        if (!isFilledD3Selection(areaPaths)) return;
        const _x = x.value;

        const zeroX = _x(0);
        const maxX = _x(gameplayStore.timeFrame.value.max);

        const scaleX = Math.round(((maxX - zeroX) / width) * 100) / 100;

        const scaleY = Math.round((maxYOverAllTime.value / maxYInSelection.value) * 100) / 100;

        const base =
            areaPaths.attr('data-existed') === 'true'
                ? areaPaths.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear)
                : areaPaths;
        areaPaths.attr('data-existed', 'true');

        base.attr('transform', `translate(${zeroX} 0) scale(${scaleX} ${scaleY})`);
    });

    // update x axis
    useSignalEffect(function lineAreaChartUpdateXAxisEffect() {
        const { xAxis } = svgParts.value;
        if (!isFilledD3Selection(xAxis)) return;
        const _x = x.value;
        xAxis.attr('font-size', renderScale * 9).style('stroke-width', renderScale);
        const base = xAxis.selectAll('*').empty()
            ? xAxis
            : xAxis.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear);
        d3Ticks(
            base.call(
                d3
                    .axisBottom(_x)
                    .tickSizeOuter(0)
                    .ticks(6)
                    .tickSize(6 * renderScale)
                    .tickSizeInner(6 * renderScale)
                    .tickSizeOuter(6 * renderScale)
                    .tickPadding(3 * renderScale)
                    .tickFormat((d) => formatTimeMs(d.valueOf())),
            ),
        )
            .attr('font-size', renderScale * 9)
            .style('stroke-width', renderScale);
    });

    // update y axis
    useSignalEffect(function lineAreaChartUpdateYAxisEffect() {
        const { yAxis } = svgParts.value;
        if (!isFilledD3Selection(yAxis)) return;

        yAxis.attr('font-size', renderScale * 9).style('stroke-width', renderScale);

        const base = yAxis.selectAll('*').empty()
            ? yAxis
            : yAxis.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear);

        d3Ticks(
            base.call(
                d3
                    .axisLeft(yInSelection.value)
                    .ticks(6)
                    .tickSize(6 * renderScale)
                    .tickSizeInner(6 * renderScale)
                    .tickSizeOuter(6 * renderScale)
                    .tickPadding(3 * renderScale),
            ),
        )
            .attr('font-size', renderScale * 9)
            .style('stroke-width', renderScale);
        // .call((g) => g.select('.domain').remove())
        // .call((g) => g.selectAll('.tick line').clone().attr('x2', width).attr('stroke-opacity', 0.1));
    });

    // update animation line
    useSignalEffect(function lineAreaChartUpdateAnimationLineEffect() {
        const { animationLine } = svgParts.value;
        if (!isFilledD3Selection(animationLine)) return;
        const _x = x.value;

        const base =
            animationLine.attr('data-existed') === 'true'
                ? animationLine.transition().duration(extraChartStore.transitionDuration).ease(d3.easeLinear)
                : animationLine;
        base.attr('data-existed', 'true');
        base.attr('x1', _x(debouncedMsIntoGame.value));
        base.attr('x2', _x(debouncedMsIntoGame.value));
    });

    return (
        <div className="snap-start snap-normal overflow-hidden">
            <h3 className="-mb-3 pt-2 text-center">{header}</h3>
            <svg
                ref={signalRef(svgSignal)}
                width={widthWithMargin}
                height={heightWithMargin}
                viewBox={`0 0 ${widthWithMargin} ${heightWithMargin}`}
                className="mx-auto h-auto w-full max-w-[550px]"
            ></svg>
            <Table>
                <TableBody>
                    {variables.map((variable) => (
                        <LineAreaChartVarRow
                            key={variable.key}
                            variable={variable}
                            isV1={isV1}
                            selectedVars={selectedVars}
                            onCheckedChange={(c) => onVariableCheckedChange(variable.key, c === true)}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
});

function LineAreaChartVarRow({
    variable,
    isV1,
    onCheckedChange,
    selectedVars,
}: {
    variable: LineChartVariableDescription;
    isV1: boolean;
    selectedVars: ReadonlySignal<FrameEndEventNumberKey[]>;
    onCheckedChange: (checked: boolean) => void;
}) {
    useSignals();
    const id = useId();

    const { key, name, color: classNames, UnitIcon } = variable;
    const isShowable = isShownInGraph(variable);

    const value = useComputed(() => {
        return animationStore.currentFrameEndEvent.value?.[key] ?? 0;
    });

    const checked = useComputed(() => selectedVars.value.includes(key));

    return (
        <TableRow>
            <TableCell className={isV1 ? '' : 'p-2 pl-3'}>
                <div className="flex flex-row items-center gap-2">
                    {isShowable ? (
                        <Checkbox
                            id={id + key + '_checkbox'}
                            checked={checked.value}
                            onCheckedChange={onCheckedChange}
                            className={classNames.checkbox}
                        />
                    ) : (
                        <span className="inline-block w-5"></span>
                    )}
                    <label
                        htmlFor={id + key + '_checkbox'}
                        className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {name}
                    </label>
                </div>
            </TableCell>
            <TableCell className={isV1 ? '' : 'text-nowrap p-2 text-right'}>
                <>{value}</>
                <span className="ml-2">
                    <UnitIcon className="inline-block h-auto w-5" />
                </span>
            </TableCell>
        </TableRow>
    );
}
