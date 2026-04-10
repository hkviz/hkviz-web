import { Bounds } from './bounds';
import { Vector2 } from './vectors';

export function scaleBounds(
	bounds: { min: { x: number; y: number }; max: { x: number; y: number } },
	scale: number,
): Bounds {
	const min = new Vector2(
		scale * bounds.min.x,
		scale * -bounds.max.y, // since y is inverted between svg and unity
	);

	const max = new Vector2(
		scale * bounds.max.x,
		scale * -bounds.min.y, // since y is inverted between svg and unity
	);

	return Bounds.fromMinMax(min, max);
}

export function scaleVector2(vector: { x: number; y: number }, scale: number): Vector2 {
	return new Vector2(scale * vector.x, scale * -vector.y);
}
