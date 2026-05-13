import * as d3 from 'd3';
import { createEffect, onCleanup, untrack } from 'solid-js';
import { Bounds } from '~/lib/game-data/shared/bounds';
import { Vector2 } from '~/lib/game-data/shared/vector2';
import { useAnimationTickStore } from '../../store/animation-tick-store';
import { TickListenerOrder } from '../../store/animation-tick-store';
import { useGameplayStore } from '../../store/gameplay-store';
import { useMapZoomStore } from '../../store/map-zoom-store';
import { createMapViewAutoZoomBounds } from './map-auto-zoom-bounds';

interface MapViewZoomProps {
	zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | undefined;
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
}

export function createMapViewZoom(props: MapViewZoomProps) {
	const animationTickStore = useAnimationTickStore();
	const mapZoomStore = useMapZoomStore();
	const gameplayStore = useGameplayStore();
	const gameModule = gameplayStore.gameModule;

	// bound calculation within this function
	const getAutoTargetBounds = createMapViewAutoZoomBounds();

	// applying bounds to map (smoothly) below
	const BOUNDS_EXTEND_TIME_SECONDS = 0.1;
	const BOUNDS_REDUCE_TIME_SECONDS = 0.1;
	const BOUNDS_REDUCE_TIME_SECONDS_AREA = 0.5;
	const AUTO_ZOOM_APPLY_EPSILON_RATIO = 0.00005;
	const AUTO_ZOOM_SNAP_TO_TARGET_EPSILON_RATIO = 0.00001;

	const boundsAnimator = {
		minX: 0,
		minY: 0,
		maxX: 0,
		maxY: 0,
		initialized: false,
	};
	const lastAppliedBounds = {
		minX: 0,
		minY: 0,
		maxX: 0,
		maxY: 0,
		initialized: false,
	};
	const recentIncludedAreaAtMs = new Map<string, number>();

	function getTransformFor(minX: number, minY: number, maxX: number, maxY: number, mapExtends: Bounds) {
		const sizeX = maxX - minX;
		const sizeY = maxY - minY;
		const scale = Math.min(3.5, Math.min(mapExtends.size.x / sizeX, mapExtends.size.y / sizeY) * 0.97);
		return d3.zoomIdentity
			.translate(mapExtends.center.x, mapExtends.center.y)
			.scale(scale)
			.translate(-(minX + sizeX / 2), -(minY + sizeY / 2));
	}

	function shouldApplyAt(minX: number, minY: number, maxX: number, maxY: number, mapExtends: Bounds) {
		if (!lastAppliedBounds.initialized) return true;
		const epsilon = Math.max(mapExtends.size.x, mapExtends.size.y) * AUTO_ZOOM_APPLY_EPSILON_RATIO;
		return (
			Math.max(
				Math.abs(minX - lastAppliedBounds.minX),
				Math.abs(minY - lastAppliedBounds.minY),
				Math.abs(maxX - lastAppliedBounds.maxX),
				Math.abs(maxY - lastAppliedBounds.maxY),
			) > epsilon
		);
	}

	function markAppliedAt(minX: number, minY: number, maxX: number, maxY: number) {
		lastAppliedBounds.minX = minX;
		lastAppliedBounds.minY = minY;
		lastAppliedBounds.maxX = maxX;
		lastAppliedBounds.maxY = maxY;
		lastAppliedBounds.initialized = true;
	}

	function getCurrentViewBounds(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
		const mapExtends = gameModule()?.map.extends;
		const node = svg.node();
		if (!node || !mapExtends) return null;
		const transform = d3.zoomTransform(node);
		if (!Number.isFinite(transform.k) || transform.k <= 0) return null;

		const min = new Vector2(transform.invertX(mapExtends.min.x), transform.invertY(mapExtends.min.y));
		const max = new Vector2(transform.invertX(mapExtends.max.x), transform.invertY(mapExtends.max.y));
		return Bounds.fromMinMax(min, max);
	}

	function resetBoundsAnimator() {
		boundsAnimator.initialized = false;
		lastAppliedBounds.initialized = false;
		recentIncludedAreaAtMs.clear();
	}

	createEffect(function autoZoomEffect() {
		const target = mapZoomStore.target();
		const enabled = mapZoomStore.enabled();
		const mapExtends = gameModule()?.map.extends;
		const usesAutoZoomMomentum =
			target === 'current-area' || target === 'current-area-smooth' || target === 'visible-rooms';
		if (!usesAutoZoomMomentum || !enabled || !mapExtends) {
			resetBoundsAnimator();
			return;
		}

		const reduceTime =
			target === 'current-area-smooth' ? BOUNDS_REDUCE_TIME_SECONDS_AREA : BOUNDS_REDUCE_TIME_SECONDS;
		// Tracks the previous frame's target Bounds by reference so we can skip the whole tick
		// when the target hasn't changed and we're already showing it.
		let lastTickTargetBounds: Bounds | null = null;

		const removeTickListener = animationTickStore.addTickListener(function autoZoomTick(deltaMs: number) {
			untrack(function autoZoomUntracked() {
				const svg = props.svg;
				const zoom = props.zoom;
				if (!svg || !zoom) return;

				const targetBounds = getAutoTargetBounds();
				if (!targetBounds) return;

				// Fast path: target Bounds is the same object as last frame AND we already applied
				// it. Nothing to animate, nothing to redraw. This is the common case once the user
				// has been sitting in a scene for a few frames.
				if (
					targetBounds === lastTickTargetBounds &&
					lastAppliedBounds.initialized &&
					lastAppliedBounds.minX === targetBounds.min.x &&
					lastAppliedBounds.minY === targetBounds.min.y &&
					lastAppliedBounds.maxX === targetBounds.max.x &&
					lastAppliedBounds.maxY === targetBounds.max.y
				) {
					return;
				}
				lastTickTargetBounds = targetBounds;

				const zoomTransform = zoom.transform.bind(zoom);

				if (!mapZoomStore.transition()) {
					resetBoundsAnimator();
					const tMinX = targetBounds.min.x;
					const tMinY = targetBounds.min.y;
					const tMaxX = targetBounds.max.x;
					const tMaxY = targetBounds.max.y;
					if (!shouldApplyAt(tMinX, tMinY, tMaxX, tMaxY, mapExtends)) return;
					svg.call(zoomTransform, getTransformFor(tMinX, tMinY, tMaxX, tMaxY, mapExtends));
					markAppliedAt(tMinX, tMinY, tMaxX, tMaxY);
					return;
				}

				if (!boundsAnimator.initialized) {
					const currentBounds = getCurrentViewBounds(svg) ?? targetBounds;
					boundsAnimator.minX = currentBounds.min.x;
					boundsAnimator.minY = currentBounds.min.y;
					boundsAnimator.maxX = currentBounds.max.x;
					boundsAnimator.maxY = currentBounds.max.y;
					boundsAnimator.initialized = true;
				}

				const dtSeconds = Math.min(0.05, Math.max(1 / 240, deltaMs / 1000));
				const alphaExtend = 1 - Math.exp(-dtSeconds / BOUNDS_EXTEND_TIME_SECONDS);
				const alphaReduce = 1 - Math.exp(-dtSeconds / reduceTime);

				const tMinX = targetBounds.min.x;
				const tMinY = targetBounds.min.y;
				const tMaxX = targetBounds.max.x;
				const tMaxY = targetBounds.max.y;

				const minXAlpha = tMinX < boundsAnimator.minX ? alphaExtend : alphaReduce;
				const minYAlpha = tMinY < boundsAnimator.minY ? alphaExtend : alphaReduce;
				const maxXAlpha = tMaxX > boundsAnimator.maxX ? alphaExtend : alphaReduce;
				const maxYAlpha = tMaxY > boundsAnimator.maxY ? alphaExtend : alphaReduce;

				boundsAnimator.minX += (tMinX - boundsAnimator.minX) * minXAlpha;
				boundsAnimator.minY += (tMinY - boundsAnimator.minY) * minYAlpha;
				boundsAnimator.maxX += (tMaxX - boundsAnimator.maxX) * maxXAlpha;
				boundsAnimator.maxY += (tMaxY - boundsAnimator.maxY) * maxYAlpha;

				const minSizeX = Math.max(1, mapExtends.size.x * 0.01);
				const minSizeY = Math.max(1, mapExtends.size.y * 0.01);
				if (boundsAnimator.maxX - boundsAnimator.minX < minSizeX) {
					const centerX = (boundsAnimator.maxX + boundsAnimator.minX) / 2;
					boundsAnimator.minX = centerX - minSizeX / 2;
					boundsAnimator.maxX = centerX + minSizeX / 2;
				}
				if (boundsAnimator.maxY - boundsAnimator.minY < minSizeY) {
					const centerY = (boundsAnimator.maxY + boundsAnimator.minY) / 2;
					boundsAnimator.minY = centerY - minSizeY / 2;
					boundsAnimator.maxY = centerY + minSizeY / 2;
				}

				// Snap to target when within epsilon — avoids endless tiny applies near convergence.
				const snapEpsilon =
					Math.max(mapExtends.size.x, mapExtends.size.y) * AUTO_ZOOM_SNAP_TO_TARGET_EPSILON_RATIO;
				const snapDelta = Math.max(
					Math.abs(boundsAnimator.minX - tMinX),
					Math.abs(boundsAnimator.minY - tMinY),
					Math.abs(boundsAnimator.maxX - tMaxX),
					Math.abs(boundsAnimator.maxY - tMaxY),
				);
				if (snapDelta <= snapEpsilon) {
					boundsAnimator.minX = tMinX;
					boundsAnimator.minY = tMinY;
					boundsAnimator.maxX = tMaxX;
					boundsAnimator.maxY = tMaxY;
				}

				const aMinX = boundsAnimator.minX;
				const aMinY = boundsAnimator.minY;
				const aMaxX = boundsAnimator.maxX;
				const aMaxY = boundsAnimator.maxY;
				if (!shouldApplyAt(aMinX, aMinY, aMaxX, aMaxY, mapExtends)) return;
				svg.call(zoomTransform, getTransformFor(aMinX, aMinY, aMaxX, aMaxY, mapExtends));
				markAppliedAt(aMinX, aMinY, aMaxX, aMaxY);
			});
		}, TickListenerOrder.AUTO_ZOOM);

		onCleanup(function cleanupAutoZoom() {
			removeTickListener();
			resetBoundsAnimator();
		});
	});
}
