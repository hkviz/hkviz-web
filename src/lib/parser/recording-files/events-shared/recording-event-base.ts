import { EventCreationContext } from './event-creation-context';

export abstract class RecordingEventBase {
	timestamp: number;
	msIntoGame = 0;
	constructor(ctx: EventCreationContext) {
		this.timestamp = ctx.timestamp;
		if (ctx.msIntoGame != null) {
			this.msIntoGame = ctx.msIntoGame;
		}
	}
}
