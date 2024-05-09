import * as d3 from 'd3';
import { roomDataUnscaled } from '@hkviz/hk-data';
import { scaleBounds } from './scaling';

type TextExportData = (typeof roomDataUnscaled)['areaNames'][number];
type TextType = 'area' | 'sub-area';

function areaTypeFromObjectPath(path: string): TextType {
    return path.includes('Sub') ? 'sub-area' : 'area';
}

export function prepareTextExportData(text: TextExportData) {
    return {
        ...text,
        position: null, //scaleVector2(text.position),
        bounds: scaleBounds(text.bounds),
        color: d3.hsl(d3.rgb(text.origColor.x * 255, text.origColor.y * 255, text.origColor.z * 255)),
        isSubArea: text.objectPath.includes('Sub') || text.convoName === 'HIVE',
        type: areaTypeFromObjectPath(text.objectPath),
    };
}

export const areaNamesWithSub = roomDataUnscaled.areaNames.map((it) => prepareTextExportData(it));
export const areaNames = areaNamesWithSub.filter((it) => !it.isSubArea);

export type AreaNameTextData = ReturnType<typeof prepareTextExportData>;
