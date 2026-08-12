import { quantize } from './quantize.ts';

export class Bounds {
	public readonly minX: number;
	public readonly minY: number;
	public readonly maxX: number;
	public readonly maxY: number;
	public readonly sizeX: number;
	public readonly sizeY: number;
	public readonly centerX: number;
	public readonly centerY: number;

	public constructor(minX: number, minY: number, maxX: number, maxY: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.sizeX = maxX - minX;
		this.sizeY = maxY - minY;
		this.centerX = (minX + maxX) / 2;
		this.centerY = (minY + maxY) / 2;
	}

	// --- Factories ---
	public static fromMinXYSizeXY(minX: number, minY: number, sizeX: number, sizeY: number): Bounds {
		return new Bounds(minX, minY, minX + sizeX, minY + sizeY);
	}

	public static fromContainingBoundsOf<T extends readonly unknown[]>(
		items: T,
		getBounds: (item: T[number]) => Bounds,
	): Bounds | null {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const item of items) {
			const b = getBounds(item);
			minX = Math.min(minX, b.minX);
			minY = Math.min(minY, b.minY);
			maxX = Math.max(maxX, b.maxX);
			maxY = Math.max(maxY, b.maxY);
		}
		return new Bounds(minX, minY, maxX, maxY);
	}

	public static fromContainingBoundsIgnoreNullOf<T extends readonly unknown[]>(
		items: T,
		getBounds: (item: T[number]) => Bounds | null | undefined,
	): Bounds | null {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		let hasValidBounds = false;
		for (const item of items) {
			const b = getBounds(item);
			if (b != null) {
				minX = Math.min(minX, b.minX);
				minY = Math.min(minY, b.minY);
				maxX = Math.max(maxX, b.maxX);
				maxY = Math.max(maxY, b.maxY);
				hasValidBounds = true;
			}
		}
		return hasValidBounds ? new Bounds(minX, minY, maxX, maxY) : null;
	}

	public toD3ViewBox(): [number, number, number, number] {
		return [this.minX, this.minY, this.sizeX, this.sizeY];
	}

	static ZERO = new Bounds(0, 0, 0, 0);
}

export function boundsMinXYMaxXY(minX: number, minY: number, maxX: number, maxY: number): Bounds {
	return new Bounds(minX, minY, maxX, maxY);
}

export function boundsQuantize(bounds: Bounds, decimals: number): Bounds {
	return new Bounds(
		quantize(bounds.minX, decimals),
		quantize(bounds.minY, decimals),
		quantize(bounds.maxX, decimals),
		quantize(bounds.maxY, decimals),
	);
}
