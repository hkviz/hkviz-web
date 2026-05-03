import type { GameId } from '~/lib/types/game-ids';
import type { ParsedRecordingHollow } from '../parser-hollow/recording-hollow';
import type { ParsedRecordingSilk } from '../parser-silk/recording-silk';

export type ParsedRecordingOfGame<Game extends GameId> = Game extends 'hollow'
	? ParsedRecordingHollow
	: Game extends 'silk'
		? ParsedRecordingSilk
		: ParsedRecordingHollow | ParsedRecordingSilk;
