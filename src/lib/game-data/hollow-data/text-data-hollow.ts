import * as d3 from 'd3';
import { hollowScaleBounds } from '~/lib/game-data/hollow-data/hollow-scaling';
import { MapTextData, MapTextType } from '~/lib/game-data/shared/map-text-data';
import { roomDataUnscaled, type HollowTextInfoGenerated } from '.';
import { colorFromRgbVector } from '../shared/colors';

function areaTypeFromObjectPath(path: string): MapTextType {
	return path.includes('Sub') ? 'sub-area' : 'area';
}

export function prepareTextExportDataHollow(text: HollowTextInfoGenerated): MapTextData {
	return {
		...text,
		position: null, //scaleVector2(text.position),
		bounds: hollowScaleBounds(text.bounds),
		color: d3.hsl(colorFromRgbVector(text.origColor)),
		isSubArea: text.objectPath.includes('Sub') || text.convoName === 'HIVE',
		type: areaTypeFromObjectPath(text.objectPath),
	};
}

export const areaNamesWithSubHollow = roomDataUnscaled.areaNames.map((it) => prepareTextExportDataHollow(it));
export const areaNamesHollow = areaNamesWithSubHollow.filter((it) => !it.isSubArea);
