import { AggregationVariable } from './aggregation-variable';

export class AggregationValueBase {
	damageTaken: number = 0;
	deaths: number = 0;

	geoEarned: number = 0;
	geoSpent: number = 0;

	timeSpendMs: number = 0;
	firstVisitMs: number | null = null;
	visits: number = 0;
	visitOrder: number | null = null;

	protected copyTo(target: AggregationValueBase) {
		target.damageTaken = this.damageTaken;
		target.deaths = this.deaths;
		target.geoEarned = this.geoEarned;
		target.geoSpent = this.geoSpent;
		target.timeSpendMs = this.timeSpendMs;
		target.firstVisitMs = this.firstVisitMs;
		target.visits = this.visits;
		target.visitOrder = this.visitOrder;
	}

	public getValue(variable: AggregationVariable): number | null {
		if (!(variable in this)) {
			throw new Error(`Variable ${variable} does not exist in AggregationValueBase`);
		}
		return this[variable as keyof AggregationValueBase] as number | null;
	}
}

export type ExtractAggregationVariable<T, V extends number | null = number | null> = {
	[K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type AggregationVariableShared = ExtractAggregationVariable<AggregationValueBase>;
export type AggregationVariableAdditiveShared = ExtractAggregationVariable<AggregationValueBase, number>;

export interface AggregationTimePointBase extends AggregationValueBase {
	msIntoGame: number;
	isActiveScene: boolean;
}
