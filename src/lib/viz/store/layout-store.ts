import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { LaneId } from '../layout/layout-location';
import { getLayoutPanelTypeById, LayoutPanelTypeId } from '../layout/layout-panel-type';

interface Lane {
	locationIds: string[];
	sizes: number[];
	panelTypes: LayoutPanelTypeId[];
}

export function createLayoutStore() {
	const [lanes, setLanes] = createStore<Record<LaneId, Lane>>({
		right: {
			locationIds: ['r1', 'r2', 'r3'],
			sizes: [0.4, 0.4, 0.18],
			panelTypes: ['splits', 'area-chart-geo', 'area-chart-health'],
		},
	});

	function selectPanelType(lane: LaneId, index: number, panelTypeId: LayoutPanelTypeId) {
		setLanes(lane, 'panelTypes', index, panelTypeId);
	}
	function sizePanel(lane: LaneId, index: number, size: number) {
		let usedFixedPart = size;
		let impactedOldSum = 0;
		const impactedIndexes: number[] = [];

		for (let i = 0; i < lanes[lane].sizes.length; i++) {
			if (i === index) continue;
			const size = lanes[lane].sizes[i];
			if (lanes[lane].sizes[i] < 0.1) {
				usedFixedPart += size;
			} else {
				impactedOldSum += size;
				impactedIndexes.push(i);
			}
		}

		if (impactedIndexes.length === 0) {
			// no other open panels that can take space. opening either first or second panel
			const openingIndex = index === 0 ? 1 : 0;
			let newSizeForOpening = 1;
			for (let i = 0; i < lanes[lane].sizes.length; i++) {
				if (i === index) {
					newSizeForOpening -= size;
				} else if (i != openingIndex) {
					newSizeForOpening -= lanes[lane].sizes[i];
				}
			}
			setLanes(lane, 'sizes', openingIndex, newSizeForOpening);
		} else {
			// distribute the remaining space proportionally on open panels
			for (const impactedIndex of impactedIndexes) {
				const oldSize = lanes[lane].sizes[impactedIndex];
				const newSize = (oldSize / impactedOldSum) * (1 - usedFixedPart);
				setLanes(lane, 'sizes', impactedIndex, newSize);
			}
		}

		setLanes(lane, 'sizes', index, size);
	}

	function minimizePanel(lane: LaneId, index: number) {
		sizePanel(lane, index, 0);
	}

	function medimizePanel(lane: LaneId, index: number) {
		const typeId = getPanelType(lane, index);
		const type = getLayoutPanelTypeById(typeId);
		sizePanel(lane, index, type.intrinsicSize);
	}

	function maximizePanel(lane: LaneId, index: number) {
		sizePanel(lane, index, 1);
	}

	function getLaneLocationIds(laneId: LaneId) {
		return lanes[laneId].locationIds;
	}

	function getPanelType(laneId: LaneId, index: number) {
		return lanes[laneId].panelTypes[index];
	}

	function getLaneSizes(laneId: LaneId) {
		return lanes[laneId].sizes;
	}

	function setLaneSizes(laneId: LaneId, sizes: number[]) {
		setLanes(laneId, 'sizes', sizes);
	}

	return {
		selectPanelType,
		getLaneLocationIds,
		getPanelType,
		minimizePanel,
		medimizePanel,
		maximizePanel,
		getLaneSizes,
		setLaneSizes,
		sizePanel,
	};
}
export type LayoutStore = ReturnType<typeof createLayoutStore>;
export const LayoutStoreContext = createContext<LayoutStore>();
export function useLayoutStore() {
	const store = useContext(LayoutStoreContext);
	if (!store) throw new Error('useLayoutStore must be used within a LayoutStoreContext.Provider');
	return store;
}
