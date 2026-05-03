import type { GameId } from '~/lib/types/game-ids';
import type { CombinedRecordingHollow } from '../parser-hollow/recording-hollow';
import type { CombinedRecordingSilk } from '../parser-silk/recording-silk';

export type CombinedRecordingOfGame<Game extends GameId> = Game extends 'hollow'
	? CombinedRecordingHollow
	: Game extends 'silk'
		? CombinedRecordingSilk
		: CombinedRecordingAny;

export type CombinedRecordingAny = CombinedRecordingHollow | CombinedRecordingSilk;
