import { GameId } from '~/lib/types/game-ids';
import { raise } from '../../util';
import { binarySearchLastIndexBefore } from '../../util/binary-search';
import { SceneEvent } from '../events-shared/scene-event';
import { RecordingEventOfGame } from '../events-specific/event-of-game';
import { FrameEndEventOfGame } from '../events-specific/frame-end-event-of-game';

export class CombinedRecordingBase<Game extends GameId> {
	public events: RecordingEventOfGame<Game>[];
	public sceneEvents: SceneEvent[] = [];
	public frameEndEvents: FrameEndEventOfGame<Game>[] = [];

	public readonly unknownEvents: number;
	public readonly parsingErrors: number;

	constructor(events: RecordingEventOfGame<Game>[], unknownEvents: number, parsingErrors: number) {
		this.events = events;
		this.unknownEvents = unknownEvents;
		this.parsingErrors = parsingErrors;
	}

	lastEvent() {
		return (
			this.events[this.events.length - 1] ?? raise(new Error(`Combined recording does not contain any events`))
		);
	}
	firstEvent() {
		return this.events[0] ?? raise(new Error(`Combined recording does not contain any events`));
	}

	sceneEventIndexFromMs(ms: number): number {
		return binarySearchLastIndexBefore(this.sceneEvents, ms, (it) => it.msIntoGame);
	}

	sceneEventFromMs(ms: number): SceneEvent | null {
		const index = this.sceneEventIndexFromMs(ms);
		return this.sceneEvents[index] ?? null;
	}

	frameEndEventIndexFromMs(ms: number): number {
		return binarySearchLastIndexBefore(this.frameEndEvents, ms, (it) => it.msIntoGame);
	}
	frameEndEventFromMs(ms: number): FrameEndEventOfGame<Game> | null {
		const index = this.frameEndEventIndexFromMs(ms);
		return this.frameEndEvents[index] ?? null;
	}
}
