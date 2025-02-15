import { type HeroStateField } from '../hero-state/hero-states';
import { type PlayerDataField } from '../player-data/player-data';
import { type RecordingFileVersion } from '../recording-file-version';
import { binarySearchLastIndexBefore, raise } from '../util';
import { FrameEndEvent } from './events/frame-end-event';
import { type HKVizModVersionEvent } from './events/hkviz-mod-version-event';
import { type ModInfo, type ModdingInfoEvent } from './events/modding-info-event';
import { PlayerDataEvent } from './events/player-data-event';
import { PlayerPositionEvent } from './events/player-position-event';
import { RecordingEventBase, type RecordingEventBaseOptions } from './events/recording-event-base';
import { SceneEvent } from './events/scene-event';
import { createRecordingSplits, type RecordingSplit } from './recording-splits';

type RecordingFileVersionEventOptions = RecordingEventBaseOptions & Pick<RecordingFileVersionEvent, 'version'>;
export class RecordingFileVersionEvent extends RecordingEventBase {
    public version: RecordingFileVersion;

    constructor(options: RecordingFileVersionEventOptions) {
        super(options);
        this.version = options.version;
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

type HeroStateEventOptions = RecordingEventBaseOptions &
    Pick<HeroStateEvent, 'field' | 'value' | 'previousPlayerPositionEvent'>;
export class HeroStateEvent extends RecordingEventBase {
    public previousPlayerPositionEvent: PlayerPositionEvent | null = null;
    public readonly field: HeroStateField;
    public readonly value: boolean;

    constructor(options: HeroStateEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
        this.field = options.field;
        this.value = options.value;
    }
}

type SpellFireballEventOptions = RecordingEventBaseOptions & Pick<SpellFireballEvent, 'previousPlayerPositionEvent'>;
export class SpellFireballEvent extends RecordingEventBase {
    public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    constructor(options: SpellFireballEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
    }
}

type SpellUpEventOptions = RecordingEventBaseOptions & Pick<SpellUpEvent, 'previousPlayerPositionEvent'>;
export class SpellUpEvent extends RecordingEventBase {
    public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    constructor(options: SpellUpEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
    }
}

type SpellDownEventOptions = RecordingEventBaseOptions & Pick<SpellDownEvent, 'previousPlayerPositionEvent'>;
export class SpellDownEvent extends RecordingEventBase {
    public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    constructor(options: SpellDownEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
    }
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
