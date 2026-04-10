import { GameId } from '~/lib/types/game-ids';
import { CombinedRecordingHollow } from '../parser-hollow/recording-hollow';
import { CombinedRecordingSilk } from '../parser-silk/recording-silk';

export type CombinedRecordingOfGame<Game extends GameId> = Game extends 'hollow'
	? CombinedRecordingHollow
	: Game extends 'silk'
		? CombinedRecordingSilk
		: CombinedRecordingAny;

export type CombinedRecordingAny = CombinedRecordingHollow | CombinedRecordingSilk;
