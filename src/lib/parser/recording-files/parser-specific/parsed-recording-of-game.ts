import { GameId } from '~/lib/types/game-ids';
import { ParsedRecordingHollow } from '../parser-hollow/recording-hollow';
import { ParsedRecordingSilk } from '../parser-silk/recording-silk';

export type ParsedRecordingOfGame<Game extends GameId> = Game extends 'hollow'
	? ParsedRecordingHollow
	: Game extends 'silk'
		? ParsedRecordingSilk
		: ParsedRecordingHollow | ParsedRecordingSilk;
