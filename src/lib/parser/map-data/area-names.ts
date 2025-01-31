import * as d3 from 'd3';
import { type TextInfoUnscaled, roomDataUnscaled, type Vector4Like } from '../../hk-data';
import { scaleBounds } from './scaling';
import { type Bounds } from '../hk-types';

type TextType = 'area' | 'sub-area';

function areaTypeFromObjectPath(path: string): TextType {
    return path.includes('Sub') ? 'sub-area' : 'area';
}

export interface TextData extends Omit<TextInfoUnscaled, 'position' | 'bounds'> {
    objectPath: string;
    convoName: string;
    sheetName: string;
    fontSize: number;
    fontWeight: number;
    origColor: Vector4Like;

    position: null;
    bounds: Bounds;
    color: d3.HSLColor;
    isSubArea: boolean;
    type: TextType;
}

export function prepareTextExportData(text: TextInfoUnscaled): TextData {
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
