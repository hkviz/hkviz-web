import { Vector2 } from './vectors';

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
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const b of bounds) {
			minX = Math.min(minX, b.min.x);
			minY = Math.min(minY, b.min.y);
			maxX = Math.max(maxX, b.max.x);
			maxY = Math.max(maxY, b.max.y);
		}
		const min = new Vector2(minX, minY);
		const max = new Vector2(maxX, maxY);
		return Bounds.fromMinMax(min, max);
	}

	public static fromContainingBoundsIgnoreNull(bounds: (Bounds | null | undefined)[]): Bounds {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const b of bounds) {
			if (b != null) {
				minX = Math.min(minX, b.min.x);
				minY = Math.min(minY, b.min.y);
				maxX = Math.max(maxX, b.max.x);
				maxY = Math.max(maxY, b.max.y);
			}
		}
		const min = new Vector2(minX, minY);
		const max = new Vector2(maxX, maxY);
		return Bounds.fromMinMax(min, max);
	}

	public static fromContainingBoundsOrZero(bounds: Bounds[] | null | undefined): Bounds {
		if (!bounds || bounds.length === 0) return Bounds.ZERO;
		return Bounds.fromContainingBounds(bounds);
	}

	public static fromContainingPoints(points: Vector2[]): Bounds {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const p of points) {
			minX = Math.min(minX, p.x);
			minY = Math.min(minY, p.y);
			maxX = Math.max(maxX, p.x);
			maxY = Math.max(maxY, p.y);
		}
		const min = new Vector2(minX, minY);
		const max = new Vector2(maxX, maxY);
		return Bounds.fromMinMax(min, max);
	}

	public toD3ViewBox(): [number, number, number, number] {
		return [this.min.x, this.min.y, this.size.x, this.size.y];
	}

	static get ZERO() {
		return new Bounds(new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0));
	}
}
