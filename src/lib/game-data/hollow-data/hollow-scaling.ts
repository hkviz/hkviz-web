import { Bounds } from '../shared/bounds';
import { scaleBounds } from '../shared/scaling';

/**
 * Everything on the ingame map is scaled up,
 * from the unity units, since those are quite small
 * and break the mouse over / click targets.
 */
export const HOLLOW_SCALE_FACTOR = 10;

export function hollowScale(value: number) {
	return value * HOLLOW_SCALE_FACTOR;
}

export function hollowScaleBounds(bounds: { min: { x: number; y: number }; max: { x: number; y: number } }): Bounds {
	return scaleBounds(bounds, HOLLOW_SCALE_FACTOR);
}
