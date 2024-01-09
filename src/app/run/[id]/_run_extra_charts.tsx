import { Card } from '@/components/ui/card';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import { formatTimeMs } from '~/lib/utils/time';
import { FrameEndEvent } from '~/lib/viz/recording-files/recording';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export interface RunExtraChartsProps {
    useViewOptionsStore: UseViewOptionsStore;
}

export function RunExtraCharts({ useViewOptionsStore }: RunExtraChartsProps) {
    return (
        <Card>
            Geo over time
            <MoneyChart useViewOptionsStore={useViewOptionsStore} />
        </Card>
    );
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

function MoneyChart({ useViewOptionsStore }: RunExtraChartsProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const recording = useViewOptionsStore((s) => s.recording);
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);

    const data = useMemo(() => {
        if (!recording) return [];
        const togetherEvents = downScale(
            recording.events.filter((it): it is FrameEndEvent => it instanceof FrameEndEvent),
        );

        return togetherEvents.map((it) => {
            const msIntoGame = it.msIntoGame;
            const geo = it.geo;
            const geoPool = it.geoPool;
            const total = geo + geoPool;
            return { geo, geoPool, total, msIntoGame };
        });
    }, [recording]);

    useEffect(() => {
        if (!recording) return;
        // Specify the chart’s dimensions.
        const width = 400;
        const height = 300;
        const marginTop = 10;
        const marginRight = 10;
        const marginBottom = 20;
        const marginLeft = 40;

        type Datum = (typeof data)[number];
        type Series = {
            data: Datum;
            0: number;
            1: number;
        }[] & { key: string; index: number };

        // Determine the series that need to be stacked.
        const series = d3.stack().keys(['geo', 'geoPool'])(data) as any as Series[];

        // Prepare the scales for positional and color encodings.
        const x = d3
            .scaleLinear()
            .domain([0, recording.events.at(-1)?.msIntoGame ?? 0] as [number, number])
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.total)] as [number, number])
            .rangeRound([height - marginBottom, marginTop]);

        function color(key: string) {
            switch (key) {
                case 'geo':
                    return '#fbb4ae';
                case 'geoPool':
                    return '#b3cde3';
                default:
                    throw new Error(`Unknown key ${key}`);
            }
        }

        console.log(series);

        // Construct an area shape.
        const area = d3
            .area<Series[number]>()
            .x((d) => x(d.data?.msIntoGame ?? 0))
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]));

        // Create the SVG container.
        const svg = d3
            .select(svgRef.current!)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;');

        // Add the y-axis, remove the domain line, add grid lines and a label.
        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 70))
            .call((g) => g.select('.domain').remove())
            .call((g) =>
                g
                    .selectAll('.tick line')
                    .clone()
                    .attr('x2', width - marginLeft - marginRight)
                    .attr('stroke-opacity', 0.1),
            );

        // Append a path for each series.
        svg.append('g')
            .selectAll()
            .data(series)
            .join('path')
            .attr('fill', (d) => color(d.key))
            .attr('d', (d) => area(d))
            .append('title')
            .text((d) => d.key);

        // Append the horizontal axis atop the area.
        svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .tickSizeOuter(0)
                    .ticks(width / 70)
                    .tickFormat((d) => formatTimeMs(d.valueOf())),
            );
    }, [data, recording]);

    useEffect(() => {}, [recording, animationMsIntoGame]);

    return <svg ref={svgRef}></svg>;
}
