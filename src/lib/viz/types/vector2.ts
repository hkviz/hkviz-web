export class Vector2 {
    public constructor(
        public x: number,
        public y: number,
    ) {}

    public static readonly ZERO = new Vector2(0, 0);

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
