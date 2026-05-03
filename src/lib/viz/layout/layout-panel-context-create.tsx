import { createMemo } from 'solid-js';
import type { LayoutStore } from '../store/layout-store';
import type { LaneId } from './layout-location';
import { getLayoutPanelTypeById } from './layout-panel-type';

export function createLayoutPanelContext(props: {
	layoutStore: LayoutStore;
	layoutLane: () => LaneId;
	layoutLaneIndex: () => number;
}) {
	const type = createMemo(() =>
		getLayoutPanelTypeById(props.layoutStore.getPanelType(props.layoutLane(), props.layoutLaneIndex())),
	);

	return {
		layoutLane() {
			return props.layoutLane();
		},
		layoutLaneIndex() {
			return props.layoutLaneIndex();
		},
		type() {
			return type();
		},
		maxSizePercent() {
			return props.layoutStore.getMaxSizePercent(props.layoutLane(), props.layoutLaneIndex());
		},
		collapsedSizePercent() {
			return props.layoutStore.getCollapsedSizePercent(props.layoutLane(), props.layoutLaneIndex());
		},
		isCollapsed() {
			return props.layoutStore.isCollapsed(props.layoutLane(), props.layoutLaneIndex());
		},
	};
}
