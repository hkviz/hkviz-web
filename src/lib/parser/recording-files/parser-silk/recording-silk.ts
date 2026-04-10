import { raise } from '../../util';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { CombinedRecordingBase } from '../parser-shared/recording-shared';
import { FrameEndEventSilk } from './frame-end-event-silk';

export type RecordingEventSilk = SceneEvent | PlayerPositionEvent | FrameEndEventSilk;

export class ParsedRecordingSilk {
	constructor(
		public readonly events: RecordingEventSilk[],
		public readonly unknownEvents: number,
		public readonly parsingErrors: number,
		public readonly combinedPartNumber: number | null,
	) {}

	lastEvent() {
		return (
			this.events[this.events.length - 1] ??
			raise(new Error(`Recording file ${this.combinedPartNumber} does not contain any events`))
		);
	}
	firstEvent() {
		return (
			this.events[0] ?? raise(new Error(`Recording file ${this.combinedPartNumber} does not contain any events`))
		);
	}
}

export class CombinedRecordingSilk extends CombinedRecordingBase<'silk'> {
	public sceneEvents: SceneEvent[] = [];
	public frameEndEvents: FrameEndEventSilk[] = [];

	public playerPositionEventsWithTracePosition: PlayerPositionEvent[] = [];

	constructor(
		events: RecordingEventSilk[],
		unknownEvents: number,
		parsingErrors: number,
		public readonly allHkVizModVersions: string[],
	) {
		super(events, unknownEvents, parsingErrors);

		for (const event of events) {
			if (event instanceof SceneEvent) {
				this.sceneEvents.push(event);
			} else if (event instanceof PlayerPositionEvent) {
				if (
					event.mapPosition != null &&
					event.previousPlayerPositionEventWithMapPosition?.mapPosition != null &&
					!event.previousPlayerPositionEventWithMapPosition.mapPosition.equals(event.mapPosition)
				) {
					this.playerPositionEventsWithTracePosition.push(event);
				}
			} else if (event instanceof FrameEndEventSilk) {
				this.frameEndEvents.push(event);
			}
		}
	}
}
