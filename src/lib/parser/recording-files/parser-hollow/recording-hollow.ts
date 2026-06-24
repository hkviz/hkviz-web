import type { Split } from '~/lib/splits/splits-shared/split';
import { raise } from '~/lib/util/other';
import type { PlayerDataFieldNameHollow } from '../../../game-data/hollow-data/player-data-hollow';
import { playerDataFieldsHollow, type PlayerDataFieldHollow } from '../../../game-data/hollow-data/player-data-hollow';
import { createRecordingSplitsHollow } from '../../../splits/splits-hollow/generate-splits-hollow';
import { isFrameEndEventHollow } from '../events-hollow/frame-end-event-check-hollow';
import type { FrameEndEventHollow } from '../events-hollow/frame-end-event-hollow';
import type { HeroStateEvent } from '../events-hollow/hero-state-event';
import { type HKVizModVersionEvent } from '../events-hollow/hkviz-mod-version-event';
import { type ModInfo, type ModdingInfoEvent } from '../events-hollow/modding-info-event';
import { PlayerDataEventHollow } from '../events-hollow/player-data-event-hollow';
import type { SpellDownEvent } from '../events-hollow/spell-down-event';
import type { SpellFireballEvent } from '../events-hollow/spell-fireball-event';
import type { SpellUpEvent } from '../events-hollow/spell-up-event';
import type { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { SceneEvent } from '../events-shared/scene-event';
import { CombinedRecordingBase } from '../parser-shared/recording-shared';
import { type RecordingFileVersionHollow } from './mod-version-hollow';

export class RecordingFileVersionEvent extends RecordingEventBase {
	public version: RecordingFileVersionHollow;

	constructor(version: RecordingFileVersionHollow, ctx: EventCreationContext) {
		super(ctx);
		this.version = version;
	}
}

export type RecordingEventHollow =
	| SceneEvent
	| PlayerPositionEvent
	| PlayerDataEventHollow<PlayerDataFieldNameHollow>
	| RecordingFileVersionEvent
	| HeroStateEvent
	| SpellFireballEvent
	| SpellDownEvent
	| SpellUpEvent
	| FrameEndEventHollow
	| ModdingInfoEvent
	| HKVizModVersionEvent;

export function isPlayerDataEventOfFieldHollow<TFieldName extends PlayerDataFieldNameHollow>(
	event: RecordingEventHollow,
	field: TFieldName,
): event is PlayerDataEventHollow<TFieldName> {
	return event instanceof PlayerDataEventHollow && event.fieldName === field;
}

export function isPlayerDataEventWithFieldTypeHollow<TFieldType extends PlayerDataFieldHollow['type']>(
	event: RecordingEventHollow,
	type: TFieldType,
): event is PlayerDataEventHollow<Extract<PlayerDataFieldHollow, { type: TFieldType }>['name']> {
	if (!(event instanceof PlayerDataEventHollow)) {
		return false;
	}
	const field = playerDataFieldsHollow.byFieldName[event.fieldName as PlayerDataFieldNameHollow];
	return field.type === type;
}

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
	public readonly playerDataEventsPerField = new Map<
		PlayerDataFieldNameHollow,
		PlayerDataEventHollow<PlayerDataFieldNameHollow>[]
	>();
	public readonly splits: Split[];
	public readonly playerPositionEventsWithTracePosition: PlayerPositionEvent[] = [];

	constructor(
		events: RecordingEventHollow[],
		unknownEvents: number,
		parsingErrors: number,
		public readonly lastPlayerDataEventsByField: Map<
			PlayerDataFieldNameHollow,
			PlayerDataEventHollow<PlayerDataFieldNameHollow>
		>,
		public readonly allModVersions: ModInfo[],
		public readonly allHkVizModVersions: string[],
	) {
		super('hollow', events, unknownEvents, parsingErrors);

		for (const event of events) {
			if (event instanceof PlayerDataEventHollow) {
				const eventsOfField = this.playerDataEventsPerField.get(event.fieldName) ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField.set(event.fieldName, eventsOfField);
			} else if (event instanceof SceneEvent) {
				this.sceneEvents.push(event);
			} else if (isFrameEndEventHollow(event)) {
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
		this.splits = createRecordingSplitsHollow(this);
	}

	lastPlayerDataEventOfField<TFieldName extends PlayerDataFieldNameHollow>(
		field: TFieldName,
	): PlayerDataEventHollow<TFieldName> | null {
		return (this.lastPlayerDataEventsByField.get(field) as any) ?? null;
	}

	getPlayerDataEventsOfField<TFieldName extends PlayerDataFieldNameHollow>(
		field: TFieldName,
	): PlayerDataEventHollow<TFieldName>[] {
		return (this.playerDataEventsPerField.get(field) as any) ?? [];
	}
}
