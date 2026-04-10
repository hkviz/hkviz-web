import { Bounds } from '../shared/bounds';
import { scaleBounds } from '../shared/scaling';

export const SILK_SCALE_FACTOR = 10;

export function silkScale(value: number) {
	return value * SILK_SCALE_FACTOR;
}

export function silkScaleBounds(bounds: { min: { x: number; y: number }; max: { x: number; y: number } }): Bounds {
	return scaleBounds(bounds, SILK_SCALE_FACTOR);
}
