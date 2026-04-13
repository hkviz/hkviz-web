import { PlayerDataFieldSilk } from '~/lib/game-data/silk-data/player-data-silk';
import { raise } from '../../../util';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { FrameEndEventSilk } from '../events-silk/frame-end-event-silk';
import { PlayerDataEventSilk } from '../events-silk/player-data-event-silk';
import { CombinedRecordingBase } from '../parser-shared/recording-shared';

export type RecordingEventSilk =
	| SceneEvent
	| PlayerPositionEvent
	| FrameEndEventSilk
	| PlayerDataEventSilk<PlayerDataFieldSilk>;

export function isPlayerDataEventOfFieldSilk<TField extends PlayerDataFieldSilk>(
	event: RecordingEventSilk,
	field: TField,
): event is PlayerDataEventSilk<TField> {
	return event instanceof PlayerDataEventSilk && event.field === field;
}

export function isPlayerDataEventWithFieldTypeSilk<FieldType extends PlayerDataFieldSilk['type']>(
	event: RecordingEventSilk,
	type: FieldType,
): event is PlayerDataEventSilk<Extract<PlayerDataFieldSilk, { type: FieldType }>> {
	return event instanceof PlayerDataEventSilk && event.field.type === type;
}

export class ParsedRecordingSilk {
	constructor(
		public readonly events: RecordingEventSilk[],
		public readonly unknownEvents: number,
		public readonly parsingErrors: number,
		public readonly combinedPartNumber: number | null,
		public readonly recordingFileVersion: number,
		public readonly hkVizModVersion: string | null,
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
	public playerDataEventsPerField = new Map<PlayerDataFieldSilk, PlayerDataEventSilk<PlayerDataFieldSilk>[]>();
	public lastPlayerDataEventsByField = new Map<PlayerDataFieldSilk, PlayerDataEventSilk<PlayerDataFieldSilk>>();

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
			} else if (event instanceof PlayerDataEventSilk) {
				const eventsOfField = this.playerDataEventsPerField.get(event.field) ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField.set(event.field, eventsOfField);
				this.lastPlayerDataEventsByField.set(event.field, event);
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
