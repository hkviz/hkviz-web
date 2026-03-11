import { LayoutPanelTypeId } from './layout-panel-type';

export interface LayoutLaneEntryWithoutLocation {
	panelTypeId: LayoutPanelTypeId;
	size: number;
}
export interface LayoutLane {
	entries: LayoutLaneEntryWithoutLocation[];
}

export type LaneId = 'right';

export interface LayoutLocation {
	laneId: LaneId;
	entryIndex: number;
}

export interface LayoutLaneEntry extends LayoutLaneEntryWithoutLocation {
	location: LayoutLocation;
}
