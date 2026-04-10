import { GameId } from '~/lib/types/game-ids';
import { RecordingEventHollow } from '../parser-hollow/recording-hollow';
import { RecordingEventSilk } from '../parser-silk/recording-silk';

export type RecordingEventAny = RecordingEventSilk | RecordingEventHollow;

export type RecordingEventOfGame<Game extends GameId> = Game extends 'hollow'
	? RecordingEventHollow
	: Game extends 'silk'
		? RecordingEventSilk
		: RecordingEventAny;
