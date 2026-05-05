import type { Vector4Like } from './vector-like.ts';

export class Vector4 {
	public readonly x: number;
	public readonly y: number;
	public readonly z: number;
	public readonly w: number;

	public constructor(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	public static readonly ZERO = new Vector4(0, 0, 0, 0);

	public magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}

	public equals(other: Vector4): boolean {
		return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
	}

	public maxElement(): number {
		return Math.max(this.x, this.y, this.z, this.w);
	}

	public minElement(): number {
		return Math.min(this.x, this.y, this.z, this.w);
	}
	public distanceTo(other: Vector4): number {
		return Math.sqrt(
			(this.x - other.x) ** 2 + (this.y - other.y) ** 2 + (this.z - other.z) ** 2 + (this.w - other.w) ** 2,
		);
	}

	public isZero(): boolean {
		return this.x === 0 && this.y === 0 && this.z === 0 && this.w === 0;
	}

	public add(other: Partial<Vector4Like>): Vector4 {
		return new Vector4(
			this.x + (other.x ?? 0),
			this.y + (other.y ?? 0),
			this.z + (other.z ?? 0),
			this.w + (other.w ?? 0),
		);
	}

	public static fromVector4Like(vector: Vector4Like): Vector4 {
		return new Vector4(vector.x, vector.y, vector.z, vector.w);
	}
}

export function vec4(x: number, y: number, z: number, w: number): Vector4 {
	return new Vector4(x, y, z, w);
}

export function vec4Quantize(vector: Vector4, decimals: number): Vector4 {
	const factor = 10 ** decimals;
	return new Vector4(
		Math.round(vector.x * factor) / factor,
		Math.round(vector.y * factor) / factor,
		Math.round(vector.z * factor) / factor,
		Math.round(vector.w * factor) / factor,
	);
}

export function vec4Like(source: Vector4Like): Vector4 {
	return new Vector4(source.x, source.y, source.z, source.w);
}
