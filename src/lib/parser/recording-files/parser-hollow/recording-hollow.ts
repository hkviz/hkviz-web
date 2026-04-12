import { raise } from '../../../util';
import { type PlayerDataField } from '../../player-data/player-data';
import { FrameEndEventHollow } from '../events-hollow/frame-end-event-hollow';
import { HeroStateEvent } from '../events-hollow/hero-state-event';
import { type HKVizModVersionEvent } from '../events-hollow/hkviz-mod-version-event';
import { type ModInfo, type ModdingInfoEvent } from '../events-hollow/modding-info-event';
import { PlayerDataEvent } from '../events-hollow/player-data-event';
import { SpellDownEvent } from '../events-hollow/spell-down-event';
import { SpellFireballEvent } from '../events-hollow/spell-fireball-event';
import { SpellUpEvent } from '../events-hollow/spell-up-event';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { SceneEvent } from '../events-shared/scene-event';
import { CombinedRecordingBase } from '../parser-shared/recording-shared';
import { type RecordingFileVersionHollow } from './mod-version-hollow';
import { createRecordingSplits, type RecordingSplit } from './recording-splits';

export class RecordingFileVersionEvent extends RecordingEventBase {
	public version: RecordingFileVersionHollow;

	constructor(version: RecordingFileVersionHollow, ctx: EventCreationContext) {
		super(ctx);
		this.version = version;
	}
}

export function isPlayerDataEventOfField<TField extends PlayerDataField>(
	event: RecordingEventHollow,
	field: TField,
): event is PlayerDataEvent<TField> {
	return event instanceof PlayerDataEvent && event.field === field;
}

export function isPlayerDataEventWithFieldType<FieldType extends PlayerDataField['type']>(
	event: RecordingEventHollow,
	type: FieldType,
): event is PlayerDataEvent<Extract<PlayerDataField, { type: FieldType }>> {
	return event instanceof PlayerDataEvent && event.field.type === type;
}

export type RecordingEventHollow =
	| SceneEvent
	| PlayerPositionEvent
	| PlayerDataEvent<PlayerDataField>
	| RecordingFileVersionEvent
	| HeroStateEvent
	| SpellFireballEvent
	| SpellDownEvent
	| SpellUpEvent
	| FrameEndEventHollow
	| ModdingInfoEvent
	| HKVizModVersionEvent;

export class ParsedRecordingHollow {
	constructor(
		public readonly events: RecordingEventHollow[],
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

export class CombinedRecordingHollow extends CombinedRecordingBase<'hollow'> {
	public playerDataEventsPerField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>[]>();
	public splits: RecordingSplit[];
	public playerPositionEventsWithTracePosition: PlayerPositionEvent[] = [];

	constructor(
		events: RecordingEventHollow[],
		unknownEvents: number,
		parsingErrors: number,
		public readonly lastPlayerDataEventsByField: Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>,
		public readonly allModVersions: ModInfo[],
		public readonly allHkVizModVersions: string[],
	) {
		super(events, unknownEvents, parsingErrors);

		for (const event of events) {
			if (event instanceof PlayerDataEvent) {
				const eventsOfField = this.playerDataEventsPerField.get(event.field) ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField.set(event.field, eventsOfField);
			} else if (event instanceof SceneEvent) {
				this.sceneEvents.push(event);
			} else if (event instanceof FrameEndEventHollow) {
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
}
