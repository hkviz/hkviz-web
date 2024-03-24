import type * as d3 from 'd3';

export function appendOutlineFilter(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>) {
    const filter = defs.append('filter').attr('id', 'hover_mask_filter');

    filter
        .append('feComponentTransfer')
        .append('feFuncA')
        .attr('type', 'linear')
        .attr('slope', 10)
        .attr('intercept', -4);

    filter.append('feGaussianBlur').attr('stdDeviation', 0.1);

    filter
        .append('feComponentTransfer')
        .append('feFuncA')
        .attr('type', 'linear')
        .attr('slope', 10)
        .attr('intercept', -2.5);
}
