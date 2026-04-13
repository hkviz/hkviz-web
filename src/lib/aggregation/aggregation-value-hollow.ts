import { AggregationMaximumMode } from './aggregation-max-mode';
import { AggregationTimePointBase, AggregationValueBase, ExtractAggregationVariable } from './aggregation-value-base';

export class AggregationValueHollow extends AggregationValueBase {
	focusing: number = 0;
	spellFireball: number = 0;
	spellUp: number = 0;
	spellDown: number = 0;

	essenceEarned: number = 0;
	essenceSpent: number = 0;

	public copyTo(target: AggregationValueHollow) {
		super.copyTo(target);
		target.focusing = this.focusing;

		target.spellFireball = this.spellFireball;
		target.spellUp = this.spellUp;
		target.spellDown = this.spellDown;

		target.essenceEarned = this.essenceEarned;
		target.essenceSpent = this.essenceSpent;
	}
}

export type AggregationVariableHollow = ExtractAggregationVariable<AggregationValueHollow>;
export type AggregationVariableAdditiveHollow = ExtractAggregationVariable<AggregationValueHollow, number>;

export class AggregationValueTimePointHollow extends AggregationValueHollow implements AggregationTimePointBase {
	msIntoGame: number = 0;
	isActiveScene: boolean = false;

	static fromAggregation(
		aggregation: AggregationValueHollow,
		msIntoGame: number,
		isActiveScene: boolean,
	): AggregationValueTimePointHollow {
		const timePoint = new AggregationValueTimePointHollow();
		aggregation.copyTo(timePoint);
		timePoint.msIntoGame = msIntoGame;
		timePoint.isActiveScene = isActiveScene;
		return timePoint;
	}
}

export const createEmptyAggregationHollow = (): AggregationValueHollow => new AggregationValueHollow();

export const EMPTY_AGGREGATION_HOLLOW: AggregationValueHollow = createEmptyAggregationHollow();

export const createAggregationTimePointCloneHollow = (
	aggregation: AggregationValueTimePointHollow | undefined,
	msIntoGame: number,
	isActiveScene: boolean,
): AggregationValueTimePointHollow =>
	AggregationValueTimePointHollow.fromAggregation(
		aggregation ?? createEmptyAggregationHollow(),
		msIntoGame,
		isActiveScene,
	);

export interface AggregatedRunDataHollow {
	countPerScene: Record<string, AggregationValueHollow>;
	maxPerMode: Record<AggregationMaximumMode, AggregationValueHollow>;
	countPerSceneOverTime: Record<string, AggregationValueTimePointHollow[]>;

	DEFAULT: AggregationValueHollow;
}
