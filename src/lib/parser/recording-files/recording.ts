import { type PlayerDataField } from '../player-data/player-data';
import { type HollowRecordingFileVersion } from '../recording-file-version';
import { binarySearchLastIndexBefore, raise } from '../util';
import { FrameEndEvent } from './events-hollow/frame-end-event';
import { HeroStateEvent } from './events-hollow/hero-state-event';
import { type HKVizModVersionEvent } from './events-hollow/hkviz-mod-version-event';
import { type ModInfo, type ModdingInfoEvent } from './events-hollow/modding-info-event';
import { PlayerDataEvent } from './events-hollow/player-data-event';
import { PlayerPositionEvent } from './events-hollow/player-position-event';
import { SceneEvent } from './events-hollow/scene-event';
import { SpellDownEvent } from './events-hollow/spell-down-event';
import { SpellFireballEvent } from './events-hollow/spell-fireball-event';
import { SpellUpEvent } from './events-hollow/spell-up-event';
import { EventCreationContext } from './events-shared/event-creation-context';
import { RecordingEventBase } from './events-shared/recording-event-base';
import { createRecordingSplits, type RecordingSplit } from './recording-splits';

export class RecordingFileVersionEvent extends RecordingEventBase {
	public version: HollowRecordingFileVersion;

	constructor(version: HollowRecordingFileVersion, ctx: EventCreationContext) {
		super(ctx);
		this.version = version;
	}
}

export function isPlayerDataEventOfField<TField extends PlayerDataField>(
	event: RecordingEvent,
	field: TField,
): event is PlayerDataEvent<TField> {
	return event instanceof PlayerDataEvent && event.field === field;
}

export function isPlayerDataEventWithFieldType<FieldType extends PlayerDataField['type']>(
	event: RecordingEvent,
	type: FieldType,
): event is PlayerDataEvent<Extract<PlayerDataField, { type: FieldType }>> {
	return event instanceof PlayerDataEvent && event.field.type === type;
}

export type RecordingEvent =
	| SceneEvent
	| PlayerPositionEvent
	| PlayerDataEvent<PlayerDataField>
	| RecordingFileVersionEvent
	| HeroStateEvent
	| SpellFireballEvent
	| SpellDownEvent
	| SpellUpEvent
	| FrameEndEvent
	| ModdingInfoEvent
	| HKVizModVersionEvent;

export class ParsedRecording {
	constructor(
		public readonly events: RecordingEvent[],
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

export class CombinedRecording extends ParsedRecording {
	public playerDataEventsPerField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>[]>();
	public frameEndEvents: FrameEndEvent[] = [];
	public sceneEvents: SceneEvent[] = [];
	public splits: RecordingSplit[];
	public playerPositionEventsWithTracePosition: PlayerPositionEvent[] = [];

	constructor(
		events: RecordingEvent[],
		unknownEvents: number,
		parsingErrors: number,
		public readonly lastPlayerDataEventsByField: Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>,
		public readonly allModVersions: ModInfo[],
		public readonly allHkVizModVersions: string[],
	) {
		super(events, unknownEvents, parsingErrors, null);

		for (const event of events) {
			if (event instanceof PlayerDataEvent) {
				const eventsOfField = this.playerDataEventsPerField.get(event.field) ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField.set(event.field, eventsOfField);
			} else if (event instanceof SceneEvent) {
				this.sceneEvents.push(event);
			} else if (event instanceof FrameEndEvent) {
				this.frameEndEvents.push(event);
			} else if (event instanceof PlayerPositionEvent) {
				if (
					event.mapPosition != null &&
					event.previousPlayerPositionEventWithMapPosition?.mapPosition != null &&
					!event.previousPlayerPositionEventWithMapPosition.mapPosition.equals(event.mapPosition)
				) {
					this.playerPositionEventsWithTracePosition.push(event);
				}
			}
		}
		this.splits = createRecordingSplits(this);
	}

	lastPlayerDataEventOfField<TField extends PlayerDataField>(field: TField): PlayerDataEvent<TField> | null {
		return (this.lastPlayerDataEventsByField.get(field) as any) ?? null;
	}

	allPlayerDataEventsOfField<TField extends PlayerDataField>(field: TField): PlayerDataEvent<TField>[] {
		return (this.playerDataEventsPerField.get(field) as any) ?? [];
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
	frameEndEventFromMs(ms: number): FrameEndEvent | null {
		const index = this.frameEndEventIndexFromMs(ms);
		return this.frameEndEvents[index] ?? null;
	}
}
