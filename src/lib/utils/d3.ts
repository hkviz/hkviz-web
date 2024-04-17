import type * as d3 from 'd3';

export function isFilledD3Selection<T extends d3.Selection<any, any, any, any>>(
    selection: null | undefined | T,
): selection is T {
    return !!selection && !selection.empty() && selection.size() > 0;
}
