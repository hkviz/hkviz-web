import * as d3 from 'd3';
import { roomDataUnscaled } from '../generated/map-rooms.generated';
import { scaleBounds, scaleVector2 } from './scaling';

type TextExportData = (typeof roomDataUnscaled)['areaNames'][number];

export function prepareTextExportData(text: TextExportData) {
    return {
        ...text,
        position: scaleVector2(text.position),
        bounds: scaleBounds(text.bounds),
        color: d3.rgb(text.origColor.x * 255, text.origColor.y * 255, text.origColor.z * 255),
        isSubArea: text.objectPath.includes('Sub'),
    };
}

export const areaNamesWithSub = roomDataUnscaled.areaNames.map((it) => prepareTextExportData(it));
export const areaNames = areaNamesWithSub.filter((it) => !it.isSubArea);

export type AreaNameTextData = ReturnType<typeof prepareTextExportData>;
