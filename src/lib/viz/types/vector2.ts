export class Vector2 {
    public constructor(
        public x: number,
        public y: number,
    ) {}

    public static readonly ZERO = new Vector2(0, 0);

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public toD3(): [number, number] {
        return [this.x, this.y];
    }

    public equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public maxElement(): number {
        return Math.max(this.x, this.y);
    }

    public minElement(): number {
        return Math.min(this.x, this.y);
    }
    public distanceTo(other: Vector2): number {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }
}
