import { Vector3Like } from './vector-like';

export class Vector3 {
	public constructor(
		public x: number,
		public y: number,
		public z: number,
	) {}

	public static readonly ZERO = new Vector3(0, 0, 0);

	public magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	public equals(other: Vector3): boolean {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}

	public maxElement(): number {
		return Math.max(this.x, this.y, this.z);
	}

	public minElement(): number {
		return Math.min(this.x, this.y, this.z);
	}
	public distanceTo(other: Vector3): number {
		return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2 + (this.z - other.z) ** 2);
	}

	public isZero(): boolean {
		return this.x === 0 && this.y === 0 && this.z === 0;
	}

	public add(other: Partial<Vector3Like>): Vector3 {
		return new Vector3(this.x + (other.x ?? 0), this.y + (other.y ?? 0), this.z + (other.z ?? 0));
	}
}
