export const RoomColorCurveLinear = {
    type: 'linear' as const,
    name: 'Linear',
    shortName: 'Linear',
    transformTo01(value: number, max: number) {
        return max ? value / max : 0;
    },
};
export const RoomColorCurveLog = {
    type: 'log' as const,
    name: 'Logarithmic',
    shortName: 'Log',
    transformTo01(value: number, max: number) {
        return max && value ? Math.log(value + 1) / Math.log(max + 1) : 0;
    },
};

export class RoomColorCurveExponential {
    readonly type = 'exponential' as const;
    name: string;
    shortName: string;
    constructor(public readonly exponent: number) {
        this.name = `Exponential ${exponent}`;
        this.shortName = `Exp ${exponent}`;
    }
    transformTo01(value: number, max: number) {
        return max ? Math.pow(value / max, 1 / this.exponent) : 0;
    }

    static EXPONENT_1_5 = new RoomColorCurveExponential(1.5);
    static EXPONENT_2 = new RoomColorCurveExponential(2);
    static EXPONENT_3 = new RoomColorCurveExponential(3);
}

export type RoomColorCurve = typeof RoomColorCurveLinear | typeof RoomColorCurveLog | RoomColorCurveExponential;

export const roomColorCurves: RoomColorCurve[] = [
    RoomColorCurveLinear,
    RoomColorCurveExponential.EXPONENT_1_5,
    RoomColorCurveExponential.EXPONENT_2,
    RoomColorCurveExponential.EXPONENT_3,
    RoomColorCurveLog,
];
