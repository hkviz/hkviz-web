import { createContext, createEffect, createMemo, untrack, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { LaneId, laneIds } from '../layout/layout-location';
import { getLayoutPanelTypeById, LayoutPanelTypeId } from '../layout/layout-panel-type';
import { ViewportStore } from './viewport-store';

interface Lane {
	locationIds: string[];
	sizes: number[];
	panelTypes: LayoutPanelTypeId[];
}

function perLaneMemo<T>(fn: (laneId: LaneId) => T): Record<LaneId, () => T> {
	return Object.fromEntries(
		laneIds.map((laneId) => {
			// eslint-disable-next-line solid/reactivity
			return [laneId, createMemo(() => fn(laneId))] as const;
		}),
	) as Record<LaneId, () => T>;
}

export function createLayoutStore(viewportStore: ViewportStore) {
	const [lanes, setLanes] = createStore<Record<LaneId, Lane>>({
		left: {
			locationIds: ['l1', 'l2'],
			sizes: [0.3, 0.7],
			panelTypes: ['map-options', 'room-info'],
		},
		right: {
			locationIds: ['r1', 'r2', 'r3'],
			sizes: [0.4, 0.4, 0.18],
			panelTypes: ['splits', 'area-chart-geo', 'area-chart-health'],
		},
		mobileMap: {
			locationIds: ['mm1', 'mm2'],
			sizes: [0.3, 0.7],
			panelTypes: ['room-info', 'map'],
		},
	});

	const [containerSizesPx, setContainerSizesPx] = createStore<Record<LaneId, number | undefined>>({
		left: undefined,
		right: undefined,
		mobileMap: undefined,
	});

	function setLaneContainerSizePx(laneId: LaneId, size: number) {
		setContainerSizesPx(laneId, size);
	}

	// eslint-disable-next-line solid/reactivity
	const maxSizesPerLanePercent = perLaneMemo((laneId) => {
		const types = lanes[laneId].panelTypes;
		const laneSize = containerSizesPx[laneId];
		return types.map((typeId) => {
			const type = getLayoutPanelTypeById(typeId);
			if (!type.maxSizeInRems || !laneSize) {
				return undefined;
			}
			const maxSize = (type.maxSizeInRems * viewportStore.rootFontSize()) / laneSize;
			return Math.min(maxSize, 1);
		});
	});

	laneIds.forEach((laneId) => {
		createEffect(() => {
			const maxSizes = maxSizesPerLanePercent[laneId]();
			untrack(() => {
				maxSizes.forEach((_, index) => {
					ensureWithinMax(laneId, index);
				});
			});
		});
	});

	const collapsedSizesPerLane = perLaneMemo((laneId) => {
		const types = lanes[laneId].panelTypes;
		const laneSize = containerSizesPx[laneId];
		return types.map((typeId) => {
			if (laneSize === undefined) {
				return 0;
			}
			const type = getLayoutPanelTypeById(typeId);
			return (type.collapsedSizeInRem * viewportStore.rootFontSize()) / laneSize;
		});
	});

	function ensureWithinMax(laneId: LaneId, index: number) {
		const max = maxSizesPerLanePercent[laneId]()[index];
		if (!max) {
			return;
		}
		if (lanes[laneId].sizes[index] > max) {
			sizePanel(laneId, index, max);
		}
	}

	function selectPanelType(lane: LaneId, index: number, panelTypeId: LayoutPanelTypeId) {
		setLanes(lane, 'panelTypes', index, panelTypeId);
		ensureWithinMax(lane, index);
	}

	function getPanelTypes(lane: LaneId) {
		return lanes[lane].panelTypes;
	}

	function getMaxSizePercent(lane: LaneId, index: number) {
		return maxSizesPerLanePercent[lane]()[index] ?? undefined;
	}

	function getCollapsedSizePercent(lane: LaneId, index: number) {
		return collapsedSizesPerLane[lane]()[index] ?? 0;
	}

	function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	function sizePanel(lane: LaneId, index: number, unboundSize: number) {
		const laneSizes = lanes[lane].sizes;
		const otherIndexes = laneSizes
			.map((_, panelIndex) => panelIndex)
			.filter((panelIndex) => panelIndex !== index);

		const minSizes = laneSizes.map((_, panelIndex) => getCollapsedSizePercent(lane, panelIndex));
		const maxSizes = laneSizes.map((_, panelIndex) => getMaxSizePercent(lane, panelIndex) ?? 1);

		const othersMinSum = otherIndexes.reduce((sum, panelIndex) => sum + minSizes[panelIndex], 0);
		const othersMaxSum = otherIndexes.reduce((sum, panelIndex) => sum + maxSizes[panelIndex], 0);

		const targetMin = Math.max(minSizes[index], 1 - othersMaxSum);
		const targetMax = Math.min(maxSizes[index], 1 - othersMinSum);
		const requestedSize = clamp(unboundSize, targetMin, targetMax);
		const desiredOthersSum = 1 - requestedSize;

		const allocations = [...laneSizes];
		for (const otherIndex of otherIndexes) {
			allocations[otherIndex] = clamp(allocations[otherIndex], minSizes[otherIndex], maxSizes[otherIndex]);
		}

		let currentOthersSum = otherIndexes.reduce((sum, otherIndex) => sum + allocations[otherIndex], 0);
		let delta = desiredOthersSum - currentOthersSum;

		if (delta < -1e-9) {
			let excess = -delta;
			let activeIndexes = otherIndexes.filter(
				(otherIndex) => allocations[otherIndex] - minSizes[otherIndex] > 1e-9,
			);

			for (let iteration = 0; iteration < 4 && activeIndexes.length > 0 && excess > 1e-9; iteration++) {
				const totalReducible = activeIndexes.reduce(
					(sum, otherIndex) => sum + (allocations[otherIndex] - minSizes[otherIndex]),
					0,
				);

				if (totalReducible <= 0) {
					break;
				}

				const uncappedIndexes: number[] = [];
				let reducedAnyToMin = false;
				let reducedTotal = 0;

				for (const otherIndex of activeIndexes) {
					const reducible = allocations[otherIndex] - minSizes[otherIndex];
					const proportionalReduction = (excess * reducible) / totalReducible;

					if (proportionalReduction >= reducible - 1e-9) {
						allocations[otherIndex] = minSizes[otherIndex];
						reducedTotal += reducible;
						reducedAnyToMin = true;
					} else {
						allocations[otherIndex] -= proportionalReduction;
						reducedTotal += proportionalReduction;
						uncappedIndexes.push(otherIndex);
					}
				}

				excess = Math.max(0, excess - reducedTotal);
				activeIndexes = reducedAnyToMin ? uncappedIndexes : [];
			}
		} else if (delta > 1e-9) {
			let shortage = delta;
			let activeIndexes = otherIndexes.filter(
				(otherIndex) => maxSizes[otherIndex] - allocations[otherIndex] > 1e-9,
			);

			for (let iteration = 0; iteration < 4 && activeIndexes.length > 0 && shortage > 1e-9; iteration++) {
				const totalGrowable = activeIndexes.reduce(
					(sum, otherIndex) => sum + (maxSizes[otherIndex] - allocations[otherIndex]),
					0,
				);

				if (totalGrowable <= 0) {
					break;
				}

				const uncappedIndexes: number[] = [];
				let grewAnyToMax = false;
				let grownTotal = 0;

				for (const otherIndex of activeIndexes) {
					const growable = maxSizes[otherIndex] - allocations[otherIndex];
					const proportionalGrowth = (shortage * growable) / totalGrowable;

					if (proportionalGrowth >= growable - 1e-9) {
						allocations[otherIndex] = maxSizes[otherIndex];
						grownTotal += growable;
						grewAnyToMax = true;
					} else {
						allocations[otherIndex] += proportionalGrowth;
						grownTotal += proportionalGrowth;
						uncappedIndexes.push(otherIndex);
					}
				}

				shortage = Math.max(0, shortage - grownTotal);
				activeIndexes = grewAnyToMax ? uncappedIndexes : [];
			}
		}

		currentOthersSum = otherIndexes.reduce((sum, otherIndex) => sum + allocations[otherIndex], 0);

		const nextSizes = [...laneSizes];
		for (const otherIndex of otherIndexes) {
			nextSizes[otherIndex] = allocations[otherIndex];
		}
		nextSizes[index] = clamp(1 - currentOthersSum, minSizes[index], maxSizes[index]);

		setLanes(lane, 'sizes', nextSizes);
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

	function getLanePanelSizes(laneId: LaneId) {
		return lanes[laneId].sizes;
	}

	function setLanePanelSizes(laneId: LaneId, sizes: number[]) {
		setLanes(laneId, 'sizes', sizes);
	}

	function isCollapsed(laneId: LaneId, index: number) {
		const size = lanes[laneId].sizes[index];
		const collapsedSize = getCollapsedSizePercent(laneId, index) ?? 0;
		return size <= collapsedSize + 0.01;
	}

	function isMaximized(laneId: LaneId, index: number) {
		const size = lanes[laneId].sizes[index];
		const directMax = getMaxSizePercent(laneId, index) ?? 1;
		const othersCollapsedSum = lanes[laneId].sizes.reduce((sum, _panelSize, panelIndex) => {
			if (panelIndex === index) {
				return sum;
			}
			return sum + getCollapsedSizePercent(laneId, panelIndex);
		}, 0);
		const effectiveMax = Math.min(directMax, Math.max(0, 1 - othersCollapsedSum));

		return size >= effectiveMax - 0.01;
	}

	return {
		selectPanelType,
		getLaneLocationIds,
		getPanelType,
		minimizePanel,
		medimizePanel,
		maximizePanel,
		getLanePanelSizes,
		setLanePanelSizes,
		sizePanel,
		getMaxSizePercent,
		getPanelTypes,
		setLaneContainerSizePx,
		getCollapsedSizePercent,
		isCollapsed,
		isMaximized,
	};
}
export type LayoutStore = ReturnType<typeof createLayoutStore>;
export const LayoutStoreContext = createContext<LayoutStore>();
export function useLayoutStore() {
	const store = useContext(LayoutStoreContext);
	if (!store) throw new Error('useLayoutStore must be used within a LayoutStoreContext.Provider');
	return store;
}
