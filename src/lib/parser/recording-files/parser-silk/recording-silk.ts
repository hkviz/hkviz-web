import { aggregateRecordingSilk } from '~/lib/aggregation/aggregate-recording-silk';
import { AggregatedRunDataSilk } from '~/lib/aggregation/aggregation-value-silk';
import { PlayerDataFieldNameSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
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
	| PlayerDataEventSilk<PlayerDataFieldNameSilk>;

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
	public readonly sceneEvents: SceneEvent[] = [];
	public readonly frameEndEvents: FrameEndEventSilk[] = [];
	public readonly playerDataEventsPerField: {
		[K in PlayerDataFieldNameSilk]?: PlayerDataEventSilk<K>[];
	} = {};
	public readonly lastPlayerDataEventsByField: {
		[K in PlayerDataFieldNameSilk]?: PlayerDataEventSilk<K>;
	} = {};

	public readonly playerPositionEventsWithTracePosition: PlayerPositionEvent[] = [];

	public readonly aggregations: AggregatedRunDataSilk;

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
				const eventsOfField = (this.playerDataEventsPerField as any)[event.fieldName] ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField[event.fieldName] = eventsOfField;
				(this.lastPlayerDataEventsByField as any)[event.fieldName] = event;
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
		this.aggregations = aggregateRecordingSilk(this);
	}

	public getPlayerDataEventsOfField<K extends PlayerDataFieldNameSilk>(field: K): PlayerDataEventSilk<K>[] {
		return this.playerDataEventsPerField[field] ?? [];
	}

	public lastPlayerDataEventOfField<K extends PlayerDataFieldNameSilk>(field: K): PlayerDataEventSilk<K> | null {
		return this.lastPlayerDataEventsByField[field] ?? null;
	}
}
