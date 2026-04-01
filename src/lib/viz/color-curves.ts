export const RoomColorCurveLinear = {
	id: 'linear' as const,
	type: 'linear' as const,
	name: 'Linear',
	shortName: 'Linear',
	transformTo01(value: number, max: number) {
		return max ? value / max : 0;
	},
};
export const RoomColorCurveLog = {
	id: 'log' as const,
	type: 'log' as const,
	name: 'Logarithmic',
	shortName: 'Log',
	transformTo01(value: number, max: number) {
		return max && value ? Math.log(value + 1) / Math.log(max + 1) : 0;
	},
};

export class RoomColorCurveExponential {
	readonly type: 'exponential' | 'root';
	readonly id: string;
	readonly isRoot: boolean;
	readonly name: string;
	readonly shortName: string;
	readonly exponentInverse: number;

	constructor(public readonly exponent: number) {
		this.isRoot = exponent < 1;
		this.type = this.isRoot ? 'root' : 'exponential';
		this.exponentInverse = 1 / exponent;
		this.id = `exp-${Math.round(exponent * 100) / 100}`;
		this.name = this.isRoot ? `Root ${this.exponentInverse}` : `Exponential ${exponent}`;
		this.shortName = this.isRoot ? `Root ${this.exponentInverse}` : `Exp ${exponent}`;
	}
	transformTo01(value: number, max: number) {
		return max ? Math.pow(value / max, this.exponent) : 0;
	}

	static EXPONENT_0_5 = new RoomColorCurveExponential(2);
	static EXPONENT_1_5 = new RoomColorCurveExponential(1 / 1.5);
	static EXPONENT_2 = new RoomColorCurveExponential(1 / 2);
	static EXPONENT_3 = new RoomColorCurveExponential(1 / 3);
}

export type RoomColorCurve = typeof RoomColorCurveLinear | typeof RoomColorCurveLog | RoomColorCurveExponential;

export const roomColorCurves: RoomColorCurve[] = [
	RoomColorCurveExponential.EXPONENT_0_5,
	RoomColorCurveLinear,
	RoomColorCurveExponential.EXPONENT_1_5,
	RoomColorCurveExponential.EXPONENT_2,
	RoomColorCurveExponential.EXPONENT_3,
	RoomColorCurveLog,
];

export const roomColorCurveById = new Map(roomColorCurves.map((curve) => [curve.id, curve] as const));
export const roomColorCurveIds = roomColorCurves.map((curve) => curve.id);

export type RoomColorCurveId = RoomColorCurve['id'];
