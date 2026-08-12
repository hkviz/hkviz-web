import { Bounds } from './bounds.ts';
import { Vector2 } from './vector2.ts';

export function scaleBounds(
	bounds: { min: { x: number; y: number }; max: { x: number; y: number } },
	scale: number,
): Bounds {
	return new Bounds(
		scale * bounds.min.x,
		scale * -bounds.max.y, // since y is inverted between svg and unity
		scale * bounds.max.x,
		scale * -bounds.min.y, // since y is inverted between svg and unity
	);
}

export function scaleVector2(vector: { x: number; y: number }, scale: number): Vector2 {
	return new Vector2(scale * vector.x, scale * -vector.y);
}
