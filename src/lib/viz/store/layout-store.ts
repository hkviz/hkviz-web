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
			panelTypes: ['map-options', 'area-analytics'],
		},
		right: {
			locationIds: ['r1', 'r2', 'r3'],
			sizes: [0.4, 0.4, 0.18],
			panelTypes: ['splits', 'area-chart-geo', 'area-chart-health'],
		},
		mobileMap: {
			locationIds: ['mm1', 'mm2'],
			sizes: [0.3, 0.7],
			panelTypes: ['area-analytics', 'map'],
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

	// eslint-disable-next-line solid/reactivity
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

	function distributeDelta(params: {
		indices: number[];
		nextSizes: number[];
		bounds: number[];
		delta: number;
		mode: 'grow' | 'shrink';
	}) {
		let remaining = params.delta;
		let active = [...params.indices];

		for (let iteration = 0; iteration < 4 && active.length > 0 && remaining > 1e-9; iteration++) {
			const capacities = active.map((panelIndex) => {
				if (params.mode === 'grow') {
					return Math.max(0, params.bounds[panelIndex] - params.nextSizes[panelIndex]);
				}
				return Math.max(0, params.nextSizes[panelIndex] - params.bounds[panelIndex]);
			});

			const totalCapacity = capacities.reduce((sum, cap) => sum + cap, 0);
			if (totalCapacity <= 1e-9) {
				break;
			}

			const weights = active.map((panelIndex, idx) => {
				if (params.nextSizes[panelIndex] > 1e-9) {
					return params.nextSizes[panelIndex];
				}
				return capacities[idx] > 1e-9 ? 1 : 0;
			});
			const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

			const uncapped: number[] = [];
			let consumed = 0;
			let cappedAny = false;

			for (let idx = 0; idx < active.length; idx++) {
				const panelIndex = active[idx];
				const capacity = capacities[idx];
				if (capacity <= 1e-9) {
					cappedAny = true;
					continue;
				}

				const weight = totalWeight > 1e-9 ? weights[idx] : 1;
				const denominator = totalWeight > 1e-9 ? totalWeight : active.length;
				const share = (remaining * weight) / denominator;

				if (share >= capacity - 1e-9) {
					if (params.mode === 'grow') {
						params.nextSizes[panelIndex] += capacity;
					} else {
						params.nextSizes[panelIndex] -= capacity;
					}
					consumed += capacity;
					cappedAny = true;
				} else {
					if (params.mode === 'grow') {
						params.nextSizes[panelIndex] += share;
					} else {
						params.nextSizes[panelIndex] -= share;
					}
					consumed += share;
					uncapped.push(panelIndex);
				}
			}

			remaining = Math.max(0, remaining - consumed);
			active = cappedAny ? uncapped : [];
		}

		return remaining;
	}

	function sizePanel(lane: LaneId, index: number, unboundSize: number) {
		const laneSizes = lanes[lane].sizes;
		const minSizes = laneSizes.map((_, panelIndex) => getCollapsedSizePercent(lane, panelIndex));
		const maxSizes = laneSizes.map((_, panelIndex) => getMaxSizePercent(lane, panelIndex) ?? 1);
		const otherIndexes = laneSizes.map((_, panelIndex) => panelIndex).filter((panelIndex) => panelIndex !== index);

		const otherMinsSum = otherIndexes.reduce((sum, panelIndex) => sum + minSizes[panelIndex], 0);
		const otherMaxSum = otherIndexes.reduce((sum, panelIndex) => sum + maxSizes[panelIndex], 0);

		const targetMin = Math.max(minSizes[index], 1 - otherMaxSum);
		const targetMax = Math.min(maxSizes[index], 1 - otherMinsSum);
		const requestedSize = clamp(unboundSize, targetMin, targetMax);

		const nextSizes = laneSizes.map((size, panelIndex) => clamp(size, minSizes[panelIndex], maxSizes[panelIndex]));
		nextSizes[index] = requestedSize;

		const desiredOthersSum = 1 - requestedSize;
		const currentOthersSum = otherIndexes.reduce((sum, panelIndex) => sum + nextSizes[panelIndex], 0);
		const delta = desiredOthersSum - currentOthersSum;

		const preferredIndexes = otherIndexes.filter(
			(panelIndex) => laneSizes[panelIndex] > minSizes[panelIndex] + 0.01,
		);
		const fallbackIndexes = otherIndexes.filter((panelIndex) => !preferredIndexes.includes(panelIndex));

		if (delta > 1e-9) {
			let remaining = distributeDelta({
				indices: preferredIndexes,
				nextSizes,
				bounds: maxSizes,
				delta,
				mode: 'grow',
			});
			if (remaining > 1e-9) {
				remaining = distributeDelta({
					indices: fallbackIndexes,
					nextSizes,
					bounds: maxSizes,
					delta: remaining,
					mode: 'grow',
				});
			}
		} else if (delta < -1e-9) {
			let remaining = distributeDelta({
				indices: preferredIndexes,
				nextSizes,
				bounds: minSizes,
				delta: -delta,
				mode: 'shrink',
			});
			if (remaining > 1e-9) {
				remaining = distributeDelta({
					indices: fallbackIndexes,
					nextSizes,
					bounds: minSizes,
					delta: remaining,
					mode: 'shrink',
				});
			}
		}

		const rebalancedOthersSum = otherIndexes.reduce((sum, panelIndex) => sum + nextSizes[panelIndex], 0);
		nextSizes[index] = clamp(1 - rebalancedOthersSum, targetMin, targetMax);

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
		if (sizes.some((size) => isNaN(size) || size < 0)) {
			return;
		}

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
		const otherCollapsedSum = lanes[laneId].sizes.reduce((sum, _panelSize, panelIndex) => {
			if (panelIndex === index) {
				return sum;
			}
			return sum + getCollapsedSizePercent(laneId, panelIndex);
		}, 0);

		const effectiveMax = Math.min(directMax, Math.max(0, 1 - otherCollapsedSum));
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
