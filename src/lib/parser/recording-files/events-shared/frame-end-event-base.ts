import type { GameId } from '~/lib/types/game-ids';
import type { EventCreationContext } from './event-creation-context';
import { RecordingEventBase } from './recording-event-base';

export abstract class FrameEndEventBase<TGame extends GameId = GameId> extends RecordingEventBase {
	abstract readonly game: TGame;

	constructor(ctx: EventCreationContext) {
		super(ctx);
	}
}
