import { Bounds } from './bounds';

export type MapTextType = 'area' | 'sub-area';

export interface MapTextData {
	objectPath: string;
	convoName: string;
	sheetName: string;
	textKey?: string; // = sheetName + '.' + convoName, for silk export. maybe hollow sometimes.

	fontSize: number;
	fontWeight: number;

	position: null;
	bounds: Bounds;
	color: d3.HSLColor;

	isSubArea: boolean;
	type: MapTextType;
}
