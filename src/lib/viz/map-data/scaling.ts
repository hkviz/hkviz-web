import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';

/**
 * Everything on the ingame map is scaled up,
 * from the unity units, since those are quite small
 * and break the mouse over / click targets.
 */
export const SCALE_FACTOR = 10;

export function scale(value: number) {
    return value * SCALE_FACTOR;
}

export function scaleBounds(bounds: { min: { x: number; y: number }; max: { x: number; y: number } }): Bounds {
    const min = new Vector2(
        scale(bounds.min.x),
        scale(-bounds.max.y), // since y is inverted between svg and unity
    );

    const max = new Vector2(
        scale(bounds.max.x),
        scale(-bounds.min.y), // since y is inverted between svg and unity
    );

    return Bounds.fromMinMax(min, max);
}

export function scaleVector2(vector: { x: number; y: number }): Vector2 {
    return new Vector2(scale(vector.x), scale(-vector.y));
}
