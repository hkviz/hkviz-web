import { AggregationMaximumMode } from './aggregation-max-mode';
import { AggregationTimePointBase, AggregationValueBase, ExtractAggregationVariable } from './aggregation-value-base';

export class AggregationValueSilk extends AggregationValueBase {
	focusing: number = 0;

	shellShardsEarned: number = 0;
	shellShardsSpent: number = 0;

	public copyTo(target: AggregationValueSilk) {
		super.copyTo(target);
		target.focusing = this.focusing;

		target.shellShardsEarned = this.shellShardsEarned;
		target.shellShardsSpent = this.shellShardsSpent;
	}
}

export type AggregationVariableSilk = ExtractAggregationVariable<AggregationValueSilk>;
export type AggregationVariableAdditiveSilk = ExtractAggregationVariable<AggregationValueSilk, number>;

export class AggregationValueTimePointSilk extends AggregationValueSilk implements AggregationTimePointBase {
	msIntoGame: number = 0;
	isActiveScene: boolean = false;

	static fromAggregation(
		aggregation: AggregationValueSilk,
		msIntoGame: number,
		isActiveScene: boolean,
	): AggregationValueTimePointSilk {
		const timePoint = new AggregationValueTimePointSilk();
		aggregation.copyTo(timePoint);
		timePoint.msIntoGame = msIntoGame;
		timePoint.isActiveScene = isActiveScene;
		return timePoint;
	}
}

export const createEmptyAggregationSilk = (): AggregationValueSilk => new AggregationValueSilk();

export const EMPTY_AGGREGATION_SILK: AggregationValueSilk = createEmptyAggregationSilk();

export const createAggregationTimePointCloneSilk = (
	aggregation: AggregationValueTimePointSilk | undefined,
	msIntoGame: number,
	isActiveScene: boolean,
): AggregationValueTimePointSilk =>
	AggregationValueTimePointSilk.fromAggregation(
		aggregation ?? createEmptyAggregationSilk(),
		msIntoGame,
		isActiveScene,
	);

export interface AggregatedRunDataSilk {
	countPerScene: Record<string, AggregationValueSilk>;
	maxPerMode: Record<AggregationMaximumMode, AggregationValueSilk>;
	countPerSceneOverTime: Record<string, AggregationValueTimePointSilk[]>;

	DEFAULT: AggregationValueSilk;
}
