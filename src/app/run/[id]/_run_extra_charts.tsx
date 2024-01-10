import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import * as d3 from 'd3';
import Image from 'next/image';
import { useId, useMemo, useRef, useState } from 'react';
import { formatTimeMs } from '~/lib/utils/time';
import { useDependableEffect } from '~/lib/viz/depdendent-effect';
import { type FrameEndEvent } from '~/lib/viz/recording-files/recording';
import coinImg from '../../../../public/ingame-sprites/HUD_coin_shop.png';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export interface RunExtraChartsProps {
    useViewOptionsStore: UseViewOptionsStore;
}

export function RunExtraCharts({ useViewOptionsStore }: RunExtraChartsProps) {
    return <MoneyChart useViewOptionsStore={useViewOptionsStore} />;
}

function downScale(data: FrameEndEvent[], maxTimeDelta = 10000) {
    console.log('Original length', data.length);
    const fields = ['geo', 'geoPool'] as const;

    let previous: FrameEndEvent | undefined = undefined;
    let current: FrameEndEvent | undefined = undefined;
    let next: FrameEndEvent | undefined = data[0];

    const filtered = [];
    let lastIncluded: FrameEndEvent | undefined = undefined;

    for (let i = 0; i < data.length; i++) {
        previous = current;
        current = next!;
        next = i + 1 < data.length ? data[i + 1] : undefined;

        if (!previous || !next) {
            filtered.push(current);
            lastIncluded = current;
            continue;
        }

        const isExtrema = fields.some((field) => {
            const previousValue = previous![field];
            const currentValue = current![field];
            const nextValue = next![field];

            return (
                (currentValue < previousValue && currentValue <= nextValue) ||
                (currentValue <= previousValue && currentValue < nextValue) ||
                (currentValue > previousValue && currentValue >= nextValue) ||
                (currentValue >= previousValue && currentValue > nextValue)
            );
        });

        if (current.msIntoGame - lastIncluded!.msIntoGame > maxTimeDelta || isExtrema) {
            filtered.push(current);
            lastIncluded = current;
        }
    }
    console.log('filtered length', filtered.length);
    return filtered;
}

const moneyChartVariables = [
    {
        key: 'geo',
        name: 'Geo',
        description: 'Geo the player has',
        color: '#fbb4ae',
        checkboxClassName: 'data-[state=checked]:bg-emerald-500 border-emerald-500 outline-emerald-500',
        pathClassName: 'text-emerald-500 fill-current',
        order: 1,
    },
    {
        key: 'geoPool',
        name: 'Shade geo',
        description: 'The geo the players shade has, which can be earned back by defeating the shade.',
        checkboxClassName: 'data-[state=checked]:bg-indigo-500 border-indigo-500 outline-indigo-500',
        pathClassName: 'text-indigo-500 fill-current',
        order: 2,
    },
] as const;

const moneyChartVariableByKey = Object.fromEntries(moneyChartVariables.map((it) => [it.key, it]));

type MoneyVariableKey = (typeof moneyChartVariables)[number]['key'];

function MoneyChart({ useViewOptionsStore }: RunExtraChartsProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const recording = useViewOptionsStore((s) => s.recording);
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const shownMsIntoGame = animationMsIntoGame;

    const [selectedVars, setSelectedVars] = useState<MoneyVariableKey[]>(moneyChartVariables.map((it) => it.key));

    function onVariableCheckedChange(key: MoneyVariableKey, checked: boolean) {
        setSelectedVars((prev: MoneyVariableKey[]) => {
            if (checked) {
                return [...prev, key].sort(
                    (a, b) => moneyChartVariableByKey[a]!.order - moneyChartVariableByKey[b]!.order,
                );
            } else {
                return prev.filter((it) => it !== key);
            }
        });
    }

    const id = useId();

    const data = useMemo(() => {
        if (!recording) return [];
        const togetherEvents = downScale(recording.frameEndEvents);

        return togetherEvents.map((it) => {
            const msIntoGame = it.msIntoGame;
            const geo = it.geo;
            const geoPool = it.geoPool;
            const total = geo + geoPool;
            return { geo, geoPool, total, msIntoGame };
        });
    }, [recording]);

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

    const mainEffectChanges = useDependableEffect(() => {
        if (!recording || selectedVars.length === 0) return;
        // Specify the chart’s dimensions.

        type Datum = (typeof data)[number];
        type Series = {
            data: Datum;
            0: number;
            1: number;
        }[] & { key: string; index: number };

        // Determine the series that need to be stacked.
        const series = d3.stack().keys(selectedVars)(data) as unknown as Series[];

        // Prepare the scales for positional and color encodings.
        const x = d3
            .scaleLinear()
            .domain([0, recording.events.at(-1)?.msIntoGame ?? 0] as [number, number])
            .range([marginLeft, widthWithMargin - marginRight]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(series.at(-1)!, (d) => d[1])] as [number, number])
            .rangeRound([heightWithMargin - marginBottom, marginTop]);

        // Construct an area shape.
        const area = d3
            .area<Series[number]>()
            .x((d) => x(d.data?.msIntoGame ?? 0))
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]));

        // Create the SVG container.
        const svg = d3.select(svgRef.current!);

        svg.selectAll('*').remove();

        // Add the y-axis, remove the domain line, add grid lines and a label.
        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(heightWithMargin / 70))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .selectAll('.tick line')
                    .clone()
                    .attr('x2', widthWithMargin - marginLeft - marginRight)
                    .attr('stroke-opacity', 0.1),
            );

        svg.append('text')
            .attr('x', marginLeft - 10)
            .attr('y', 14)
            .attr('text-anchor', 'end')
            .attr('class', 'text-foreground fill-current text-xs')
            .text('Geo');

        // .style('transform', 'rotate(-90deg)')
        // .style('transform-box', 'fill-box')
        // .style('transform-origin', 'center');

        // Append a path for each series.
        svg.append('g')
            .selectAll()
            .data(series)
            .join('path')
            .attr('class', (d) => moneyChartVariableByKey[d.key]?.pathClassName ?? '')
            .attr('d', (d) => area(d))
            .append('title')
            .text((d) => d.key);

        // Append the horizontal axis atop the area.
        svg.append('g')
            .attr('transform', `translate(0,${heightWithMargin - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .tickSizeOuter(0)
                    .ticks(widthWithMargin / 70)
                    .tickFormat((d) => formatTimeMs(d.valueOf())),
            );

        svg.append('text')
            .attr('x', widthWithMargin / 2)
            .attr('y', heightWithMargin - 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-foreground fill-current text-xs')
            .text('Time');
    }, [
        data,
        recording,
        selectedVars,
        heightWithMargin,
        widthWithMargin,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
    ]);

    return (
        <Card className="overflow-hidden">
            <h3 className="pt-3 text-center">
                <Image src={coinImg} alt="Geo" className="mr-2 inline-block w-6" />
                Geo over time
            </h3>
            <svg
                ref={svgRef}
                width={widthWithMargin}
                height={heightWithMargin}
                viewBox={`0 0 ${widthWithMargin} ${heightWithMargin}`}
                className="h-auto max-w-full"
            ></svg>
            <Table>
                <TableBody>
                    {moneyChartVariables.map((variable) => (
                        <TableRow key={variable.key}>
                            <TableCell>
                                <div className="flex flex-row items-center gap-2">
                                    <Checkbox
                                        id={id + variable.key + '_checkbox'}
                                        checked={selectedVars.includes(variable.key)}
                                        onCheckedChange={(c) => onVariableCheckedChange(variable.key, c === true)}
                                        className={variable.checkboxClassName}
                                    />
                                    <label
                                        htmlFor={id + variable.key + '_checkbox'}
                                        className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {variable.name}
                                    </label>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {currentEndOfGame?.[variable.key] ?? 0}
                                <Image src={coinImg} alt="Geo" className="ml-2 inline-block w-4" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
