import { GameId } from '~/lib/types/game-ids';
import { FrameEndEventHollow } from '../events-hollow/frame-end-event-hollow';
import { FrameEndEventSilk } from '../events-silk/frame-end-event-silk';

export type FrameEndEventAny = FrameEndEventHollow | FrameEndEventSilk;

export type FrameEndEventOfGame<Game extends GameId> = Game extends 'hollow'
	? FrameEndEventHollow
	: Game extends 'silk'
		? FrameEndEventSilk
		: FrameEndEventAny;
