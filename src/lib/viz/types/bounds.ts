import { Vector2 } from './vector2';

export class Bounds {
	private constructor(
        public min: Vector2,
        public max: Vector2,
        public size: Vector2,
        public center: Vector2,
	) {
		
	}

	// --- Factories ---

	public static fromMinMax(min: Vector2, max: Vector2): Bounds {
		const size = {
			x: max.x - min.x,
			y: max.y - min.y,
		};
		return new Bounds(
			min,
			max,
			size,
			{
				x: min.x + size.x / 2,
				y: min.y + size.y / 2,
			},
		);
	}

	public static fromMinCenter(min: Vector2, center: Vector2): Bounds {
		const size = {
			x: (center.x - min.x) * 2,
			y: (center.y - min.y) * 2,
		};
		const max = {
			x: min.x + size.x,
			y: min.y + size.y,
		};
		return new Bounds(
			min,
			max,
			size,
			center,
		);
	}

	public static fromMinSize(min: Vector2, size: Vector2): Bounds {
		const max = new Vector2(
			min.x + size.x,
			min.y + size.y,
		);
		const center = new Vector2(
			min.x + size.x / 2,
			min.y + size.y / 2,
		);
		return new Bounds(
			min,
			max,
			size,
			center,
		);
	}

	public static fromContainingBounds(bounds: Bounds[]): Bounds {
		const min = new Vector2(
			Math.min(...bounds.map(b => b.min.x)),
			Math.min(...bounds.map(b => b.min.y)),
		);
		const max = new Vector2(
			Math.max(...bounds.map(b => b.max.x)),
			Math.max(...bounds.map(b => b.max.y)),
		);
		return Bounds.fromMinMax(min, max);
	}

	public toD3ViewBox(): [number, number, number, number] {
		return [
			this.min.x,
			this.min.y,
			this.max.x,
			this.max.y,
		];
	}
}
