import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import * as d3 from 'd3';
import { type D3BrushEvent } from 'd3-brush';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import useEvent from 'react-use-event-hook';
import { formatTimeMs } from '~/lib/utils/time';
import useIsVisibleRef from '~/lib/utils/use-is-visible';
import { useDependableEffect } from '~/lib/viz/depdendent-effect';
import { type FrameEndEvent } from '~/lib/viz/recording-files/events/frame-end-event';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { downScale } from './down-scale';

export type FrameEndVariableKey = keyof FrameEndEvent;

export interface LineChartVariableClassNames {
    checkbox: string;
    path: string;
}

export type LineChartVariableDescription = {
    key: FrameEndVariableKey;
    name: string;
    description: string;
    UnitIcon: React.FunctionComponent<{ className?: string; useViewOptionsStore: UseViewOptionsStore }>;
    order: number;
    classNames: LineChartVariableClassNames;
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
    useViewOptionsStore: UseViewOptionsStore;
    variables: LineChartVariableDescription[];
    yAxisLabel: string;
    header: React.ReactNode;
    minimalMaximumY: number;
    downScaleMaxTimeDelta: number;
}

export function LineAreaChart({
    useViewOptionsStore,
    variables,
    yAxisLabel,
    header,
    minimalMaximumY,
    downScaleMaxTimeDelta,
}: LineAreaChartProps) {
    const variablesPerKey = useMemo(() => {
        return Object.fromEntries(variables.map((it) => [it.key, it] as const));
    }, [variables]);

    const svgRef = useRef<SVGSVGElement>(null);

    const recording = useViewOptionsStore((s) => s.recording);
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const shownMsIntoGame = animationMsIntoGame;

    const _extraChartsTimeBounds = useViewOptionsStore((s) => s.extraChartsTimeBounds);
    const setExtraChartsTimeBounds = useViewOptionsStore((s) => s.setExtraChartsTimeBounds);
    const resetExtraChartsTimeBounds = useViewOptionsStore((s) => s.resetExtraChartsTimeBounds);
    const isAnythingAnimating = useViewOptionsStore((s) => s.isAnythingAnimating);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);

    // timebounds debouncing, so we can use d3 animations
    const isVisible = useIsVisibleRef(svgRef);
    // console.log({isVisible, name: yAxisLabel})
    const transitionDuration = 250;
    const [debouncedExtraChartsTimeBounds, setDebouncedExtraChartsTimeBounds] = useState(_extraChartsTimeBounds);
    const [debouncedShownMsIntoGame, setDebouncedShownMsIntoGame] = useState(shownMsIntoGame);
    useEffect(() => {
        const id = setInterval(() => {
            if (!isVisible.current) return;
            const s = useViewOptionsStore.getState();
            setDebouncedExtraChartsTimeBounds(s.extraChartsTimeBounds);
            setDebouncedShownMsIntoGame(s.animationMsIntoGame);
        }, transitionDuration);
        return () => clearInterval(id);
    }, [isVisible, useViewOptionsStore]);

    const [selectedVars, setSelectedVars] = useState<FrameEndVariableKey[]>(
        variables
            .filter(isShownInGraph)
            .filter((it) => !it.defaultHidden)
            .toSorted((a, b) => a.order - b.order)
            .map((it) => it.key),
    );

    function onVariableCheckedChange(key: FrameEndVariableKey, checked: boolean) {
        setSelectedVars((prev: FrameEndVariableKey[]) => {
            if (checked) {
                return [...prev, key].sort((a, b) => variablesPerKey[a]!.order - variablesPerKey[b]!.order);
            } else {
                return prev.filter((it) => it !== key);
            }
        });
    }

    const id = useId();

    const data = useMemo(() => {
        if (!recording) return [];
        const togetherEvents = downScale(
            recording.frameEndEvents,
            variables.map((it) => it.key),
            downScaleMaxTimeDelta,
        );
        return togetherEvents;
    }, [downScaleMaxTimeDelta, recording, variables]);

    type Datum = FrameEndEvent;
    type Series = {
        data: Datum;
        0: number;
        1: number;
    }[] & { key: string; index: number };

    const currentEndOfGame = useMemo(() => {
        if (!recording) return null;
        return recording.frameEndEvents.findLast((it) => it.msIntoGame <= shownMsIntoGame);
    }, [recording, shownMsIntoGame]);

    const widthWithMargin = 400;
    const heightWithMargin = 300;
    const marginTop = 25;
    const marginRight = 10;
    const marginBottom = 35;
    const marginLeft = 45;
    const height = heightWithMargin - marginTop - marginBottom;
    const width = widthWithMargin - marginLeft - marginRight;

    // Determine the series that need to be stacked.
    const series = useMemo(
        () =>
            d3.stack<Datum>().keys(selectedVars.length === 0 ? variables.map((it) => it.key) : selectedVars)(
                data,
            ) as unknown as Series[],
        [data, selectedVars, variables],
    );

    // useMemo(() => {
    //     series.forEach((it) => {
    //         it.forEach((it2) => {
    //             it2[1] = it2[1] - it2[0];
    //             it2[0] = 0;
    //             return it2;
    //         });
    //         return it;
    //     });
    // }, [series]);

    const x = useMemo(() => {
        return d3.scaleLinear().domain(debouncedExtraChartsTimeBounds).range([0, width]);
    }, [debouncedExtraChartsTimeBounds, width]);

    const xNotAnimated = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([recording?.events?.[0]?.msIntoGame ?? 0, recording?.events?.at?.(-1)?.msIntoGame ?? 0])
            .range([0, width]);
    }, [recording, width]);

    // const y = useMemo(() => {
    //     return d3
    //         .scaleLinear()
    //         .domain([
    //             0,
    //             Math.max(
    //                 minimalMaximumY,
    //                 series.at(-1)!.findLast((it) => it.data.msIntoGame < debouncedExtraChartsTimeBounds[0])?.[1] ?? 0,
    //                 d3.max(series.at(-1)!, (d) =>
    //                     // max only over the selected timeframe --> therefore y axis zooms too
    //                     d.data.msIntoGame >= debouncedExtraChartsTimeBounds[0] - 10000 &&
    //                     d.data.msIntoGame <= debouncedExtraChartsTimeBounds[1] + 10000
    //                         ? d[1]
    //                         : 0,
    //                 ) ?? 0,
    //             ),
    //         ] as [number, number])
    //         .rangeRound([height, 0]);
    // }, [debouncedExtraChartsTimeBounds, series, height, minimalMaximumY]);

    const y = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, d3.max(series.at(-1)!, (d) => d[1]) ?? minimalMaximumY] as [number, number])
            .rangeRound([height, 0]);
    }, [series, height, minimalMaximumY]);

    const skipNextUpdate = useRef(false);
    const onBrushEnd = useEvent((event: D3BrushEvent<unknown>) => {
        const selection = (event.selection ?? null) as [number, number] | null;

        if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
        }

        if (selection == null) {
            resetExtraChartsTimeBounds();
        } else {
            const invSelection = [x.invert(selection[0]), x.invert(selection[1])] as const;
            setExtraChartsTimeBounds(invSelection);
        }
        // todo animate axis
        skipNextUpdate.current = true;
        brush.current!.move(brushG.current!, null);
    });

    const areaPaths = useRef<d3.Selection<SVGPathElement | null, Series, SVGGElement, unknown>>();
    const xAxis = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const yAxis = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const brush = useRef<d3.BrushBehavior<unknown>>();
    const brushG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const animationLine = useRef<d3.Selection<SVGLineElement, unknown, null, undefined>>();

    const mainEffectChanges = useDependableEffect(() => {
        if (!recording) return;
        // Specify the chart’s dimensions.

        // Create the SVG container.
        const svg = d3.select(svgRef.current!);

        svg.selectAll('*').remove();

        svg.append('text')
            .attr('x', marginLeft - 10)
            .attr('y', 14)
            .attr('text-anchor', 'end')
            .attr('class', 'text-foreground fill-current text-xs')
            .text(yAxisLabel);

        // .style('transform', 'rotate(-90deg)')
        // .style('transform-box', 'fill-box')
        // .style('transform-origin', 'center');

        // Append the horizontal axis atop the area.

        svg.append('text')
            .attr('x', widthWithMargin / 2)
            .attr('y', heightWithMargin - 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-foreground fill-current text-xs')
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

        areaPaths.current = rootG
            .append('g')
            .attr('clip-path', `url(#${id}clip)`)
            .selectAll()
            .data(series)
            .join('path')
            .attr('class', (d) => variablesPerKey[d.key]?.classNames?.path ?? '');
        areaPaths.current.append('title').text((d) => d.key);

        // axis x
        xAxis.current = rootG.append('g').attr('transform', `translate(0,${height})`);

        // axis y
        yAxis.current = rootG.append('g');

        // brush
        brush.current = d3
            .brushX()
            .extent([
                [0, 0],
                [width, height],
            ])
            .on('end', onBrushEnd);
        brushG.current = rootG.append('g').attr('class', 'brush');
        brushG.current.call(brush.current);

        // animationLine
        animationLine.current = rootG
            .append('line')
            .attr('class', 'stroke-current text-foreground')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3 3')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height);
    }, [height, id, recording, width, onBrushEnd, series, yAxisLabel, variablesPerKey]);

    // update area
    useEffect(() => {
        if (!areaPaths.current) return;

        // Construct an area shape.
        const area = d3
            .area<Series[number]>()
            .x((d) => {
                return xNotAnimated(d.data?.msIntoGame ?? 0);
            })
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]))
            .curve(d3.curveStep);

        areaPaths.current.transition().ease(d3.easeLinear).duration(transitionDuration).attr('d', area);
        //areaPaths.current.attr('d', area);

        // areaPaths.current.attr('d', area);
        // }, [mainEffectChanges, recording, width, x, y]);
    }, [mainEffectChanges, recording, width, xNotAnimated, y]);

    // update area movement
    useEffect(() => {
        const paths = areaPaths.current;
        if (!paths) return;

        const zeroX = x(0);
        const maxX = x(timeFrame.max);

        const scaleX = Math.round(((maxX - zeroX) / width) * 100) / 100;

        const base =
            paths.attr('data-existed') === 'true'
                ? paths.transition().duration(transitionDuration).ease(d3.easeLinear)
                : paths;
        paths.attr('data-existed', 'true');

        base.attr('transform', `translate(${zeroX} 0) scale(${scaleX} 1)`);
    }, [mainEffectChanges, timeFrame.max, width, x]);

    // update x axis
    useEffect(() => {
        if (!xAxis.current) return;
        const xAxisCallee = d3
            .axisBottom(x)
            .tickSizeOuter(0)
            .ticks(width / 70)
            .tickFormat((d) => formatTimeMs(d.valueOf()));

        if (xAxis.current.selectAll('*').empty()) {
            xAxis.current.call(xAxisCallee);
        } else {
            xAxis.current.transition().duration(transitionDuration).ease(d3.easeLinear).call(xAxisCallee);
        }
    }, [mainEffectChanges, width, x]);

    // update y axis
    useEffect(() => {
        if (!yAxis.current) return;

        const base = yAxis.current.selectAll('*').empty()
            ? yAxis.current
            : yAxis.current.transition().duration(transitionDuration).ease(d3.easeLinear);

        base.call(d3.axisLeft(y).ticks(height / 50));
        // .call((g) => g.select('.domain').remove())
        // .call((g) => g.selectAll('.tick line').clone().attr('x2', width).attr('stroke-opacity', 0.1));
    }, [mainEffectChanges, height, y]);

    // update animation line
    useEffect(() => {
        const line = animationLine.current;
        if (!line) return;

        const base =
            line.attr('data-existed') === 'true'
                ? line.transition().duration(transitionDuration).ease(d3.easeLinear)
                : line;
        base.attr('data-existed', 'true');
        base.attr('x1', x(debouncedShownMsIntoGame));
        base.attr('x2', x(debouncedShownMsIntoGame));
    }, [mainEffectChanges, debouncedShownMsIntoGame, x, transitionDuration]);

    // update animation line visibility
    useEffect(() => {
        const line = animationLine.current;
        if (!line) return;
        line.attr('visibility', isAnythingAnimating ? 'visible' : 'hidden');
    }, [mainEffectChanges, isAnythingAnimating]);

    return (
        <div className="overflow-hidden">
            <h3 className="pt-3 text-center">{header}</h3>
            <svg
                ref={svgRef}
                width={widthWithMargin}
                height={heightWithMargin}
                viewBox={`0 0 ${widthWithMargin} ${heightWithMargin}`}
                className="mx-auto h-auto w-full max-w-[550px]"
            ></svg>
            <Table>
                <TableBody>
                    {variables.map((variable) => {
                        const { key, name, classNames, UnitIcon } = variable;
                        const isShowable = isShownInGraph(variable);

                        return (
                            <TableRow key={key}>
                                <TableCell>
                                    <div className="flex flex-row items-center gap-2">
                                        {isShowable ? (
                                            <Checkbox
                                                id={id + key + '_checkbox'}
                                                checked={selectedVars.includes(key)}
                                                onCheckedChange={(c) => onVariableCheckedChange(key, c === true)}
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
                                <TableCell className="text-right">
                                    {currentEndOfGame?.[key] ?? 0}
                                    <span className="ml-2">
                                        <UnitIcon
                                            className="inline-block h-auto w-5"
                                            useViewOptionsStore={useViewOptionsStore}
                                        />
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
