export class Timeframe {
	public readonly min: number;
	public readonly max: number;
	public readonly delta: number;

	constructor(min: number, max: number) {
		this.min = min;
		this.max = max;
		this.delta = max - min;
	}

	public msIntoGameToPercentage(ms: number): number {
		return Math.max(0, Math.min(1, (ms - this.min) / this.delta));
	}

	public percentageToMsIntoGame(percentage: number): number {
		return percentage * this.delta + this.min;
	}
}
