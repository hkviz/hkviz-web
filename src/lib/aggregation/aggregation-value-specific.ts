import { GameId } from '../types/game-ids';
import { AggregationTimePointBase, AggregationValueBase } from './aggregation-value-base';
import {
	AggregatedRunDataHollow,
	AggregationValueHollow,
	AggregationValueTimePointHollow,
	AggregationVariableHollow,
} from './aggregation-value-hollow';
import {
	AggregatedRunDataSilk,
	AggregationValueSilk,
	AggregationValueTimePointSilk,
	AggregationVariableSilk,
} from './aggregation-value-silk';

export type AggregationValueAny = AggregationValueHollow | AggregationValueSilk;
export type AggregationValueOfGame<Game extends GameId> = Game extends 'hollow'
	? AggregationValueHollow
	: Game extends 'silk'
		? AggregationValueSilk
		: AggregationValueAny;

export type AggregationValueTimePointAny = AggregationValueTimePointHollow | AggregationValueTimePointSilk;
export type AggregationValueTimePointOfGame<Game extends GameId> = Game extends 'hollow'
	? AggregationValueTimePointHollow
	: Game extends 'silk'
		? AggregationValueTimePointSilk
		: AggregationValueTimePointAny;

export type AggregationVariableAny = AggregationVariableHollow | AggregationVariableSilk;
export type AggregationVariableOfGame<Game extends GameId> = Game extends 'hollow'
	? AggregationVariableHollow
	: Game extends 'silk'
		? AggregationVariableSilk
		: AggregationVariableAny;

export type AggregatedRunDataAny = AggregatedRunDataSilk | AggregatedRunDataHollow;
export type AggregatedRunDataOfGame<Game extends GameId> = Game extends 'hollow'
	? AggregatedRunDataHollow
	: Game extends 'silk'
		? AggregatedRunDataSilk
		: AggregatedRunDataAny;

export function isAggregationTimepoint(
	aggregation: AggregationValueBase,
): aggregation is AggregationValueBase & AggregationTimePointBase {
	return 'msIntoGame' in aggregation;
}
