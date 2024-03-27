import { Vector2 } from './vector2';

export class Bounds {
    private constructor(
        public min: Vector2,
        public max: Vector2,
        public size: Vector2,
        public center: Vector2,
    ) {}

    // --- Factories ---

    public static fromMinMax(min: Vector2, max: Vector2): Bounds {
        const size = new Vector2(max.x - min.x, max.y - min.y);
        return new Bounds(min, max, size, new Vector2(min.x + size.x / 2, min.y + size.y / 2));
    }

    public static fromMinCenter(min: Vector2, center: Vector2): Bounds {
        const size = new Vector2((center.x - min.x) * 2, (center.y - min.y) * 2);
        const max = new Vector2(min.x + size.x, min.y + size.y);
        return new Bounds(min, max, size, center);
    }

    public static fromMinSize(min: Vector2, size: Vector2): Bounds {
        const max = new Vector2(min.x + size.x, min.y + size.y);
        const center = new Vector2(min.x + size.x / 2, min.y + size.y / 2);
        return new Bounds(min, max, size, center);
    }

    public static fromContainingBounds(bounds: Bounds[]): Bounds {
        const min = new Vector2(Math.min(...bounds.map((b) => b.min.x)), Math.min(...bounds.map((b) => b.min.y)));
        const max = new Vector2(Math.max(...bounds.map((b) => b.max.x)), Math.max(...bounds.map((b) => b.max.y)));
        return Bounds.fromMinMax(min, max);
    }

    public static fromContainingPoints(points: Vector2[]): Bounds {
        const min = new Vector2(Math.min(...points.map((p) => p.x)), Math.min(...points.map((p) => p.y)));
        const max = new Vector2(Math.max(...points.map((p) => p.x)), Math.max(...points.map((p) => p.y)));
        return Bounds.fromMinMax(min, max);
    }

    public toD3ViewBox(): [number, number, number, number] {
        return [this.min.x, this.min.y, this.size.x, this.size.y];
    }
}
