import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import * as d3 from 'd3';
import { type D3BrushEvent } from 'd3-brush';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import useEvent from 'react-use-event-hook';
import { formatTimeMs } from '~/lib/utils/time';
import { useDependableEffect } from '~/lib/viz/depdendent-effect';
import { type FrameEndEvent } from '~/lib/viz/recording-files/recording';
import { type UseViewOptionsStore } from '../_viewOptionsStore';
import { downScale } from './down-scale';

export type FrameEndVariableKey = keyof FrameEndEvent;

export interface LineChartVariableDescription {
    key: FrameEndVariableKey;
    name: string;
    description: string;
    checkboxClassName: string;
    pathClassName: string;
    UnitIcon: React.FunctionComponent<{ className?: string }>;
    order: number;
}

export interface LineAreaChartProps {
    useViewOptionsStore: UseViewOptionsStore;
    variables: LineChartVariableDescription[];
    yAxisLabel: string;
    header: React.ReactNode;
}

export function LineAreaChart({ useViewOptionsStore, variables, yAxisLabel, header }: LineAreaChartProps) {
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

    // timebounds debouncing, so we can use d3 animations
    const transitionDuration = 250;
    const [debouncedExtraChartsTimeBounds, setDebouncedExtraChartsTimeBounds] = useState(_extraChartsTimeBounds);
    const [debouncedShownMsIntoGame, setDebouncedShownMsIntoGame] = useState(shownMsIntoGame);
    useEffect(() => {
        const id = setInterval(() => {
            const s = useViewOptionsStore.getState();
            setDebouncedExtraChartsTimeBounds(s.extraChartsTimeBounds);
            setDebouncedShownMsIntoGame(s.animationMsIntoGame);
        }, transitionDuration);
        return () => clearInterval(id);
    }, [useViewOptionsStore]);

    const [selectedVars, setSelectedVars] = useState<FrameEndVariableKey[]>(
        variables.toSorted((a, b) => a.order - b.order).map((it) => it.key),
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
        );
        return togetherEvents;
    }, [recording, variables]);

    type Datum = (typeof data)[number];
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
        () => d3.stack<Datum>().keys(selectedVars)(data) as unknown as Series[],
        [data, selectedVars],
    );

    const x = useMemo(() => {
        console.log('new x');
        return d3.scaleLinear().domain(debouncedExtraChartsTimeBounds).range([0, width]);
    }, [debouncedExtraChartsTimeBounds, width]);

    const y = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([
                0,
                Math.max(
                    100,
                    series.at(-1)!.findLast((it) => it.data.msIntoGame < debouncedExtraChartsTimeBounds[0])?.[1] ?? 0,
                    d3.max(series.at(-1)!, (d) =>
                        // max only over the selected timeframe --> therefore y axis zooms too
                        d.data.msIntoGame >= debouncedExtraChartsTimeBounds[0] - 10000 &&
                        d.data.msIntoGame <= debouncedExtraChartsTimeBounds[1] + 10000
                            ? d[1]
                            : 0,
                    ) ?? 0,
                ),
            ] as [number, number])
            .rangeRound([height, 0]);
    }, [debouncedExtraChartsTimeBounds, series, height]);

    const skipNextUpdate = useRef(false);
    const onBrushEnd = useEvent((event: D3BrushEvent<unknown>) => {
        const selection = (event.selection ?? null) as [number, number] | null;

        if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
        }

        if (selection == null) {
            console.log('null reset');
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
            .attr('class', (d) => variablesPerKey[d.key]?.pathClassName ?? '');
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
                return x(d.data?.msIntoGame ?? 0);
            })
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]))
            .curve(d3.curveStep);

        areaPaths.current.transition().ease(d3.easeLinear).duration(transitionDuration).attr('d', area);
        //areaPaths.current.attr('d', area);

        // areaPaths.current.attr('d', area);
    }, [mainEffectChanges, recording, width, x, y]);

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
            console.log('transition x axis');
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
                className="h-auto max-w-full"
            ></svg>
            <Table>
                <TableBody>
                    {variables.map(({ key, name, UnitIcon: Unit, checkboxClassName }) => (
                        <TableRow key={key}>
                            <TableCell>
                                <div className="flex flex-row items-center gap-2">
                                    <Checkbox
                                        id={id + key + '_checkbox'}
                                        checked={selectedVars.includes(key)}
                                        onCheckedChange={(c) => onVariableCheckedChange(key, c === true)}
                                        className={checkboxClassName}
                                    />
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
                                <Unit className="ml-2" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
