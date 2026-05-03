import type { GameId } from '~/lib/types/game-ids';
import type { RecordingEventHollow } from '../parser-hollow/recording-hollow';
import type { RecordingEventSilk } from '../parser-silk/recording-silk';

export type RecordingEventAny = RecordingEventSilk | RecordingEventHollow;

export type RecordingEventOfGame<Game extends GameId> = Game extends 'hollow'
	? RecordingEventHollow
	: Game extends 'silk'
		? RecordingEventSilk
		: RecordingEventAny;
