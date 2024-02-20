import { raise } from '~/lib/utils/utils';
import { type HeroStateField } from '../hero-state/hero-states';
import { type PlayerDataField } from '../player-data/player-data';
import { type RecordingFileVersion } from '../types/recording-file-version';
import { FrameEndEvent } from './events/frame-end-event';
import { type ModInfo, type ModdingInfoEvent } from './events/modding-info-event';
import { PlayerDataEvent } from './events/player-data-event';
import { type PlayerPositionEvent } from './events/player-position-event';
import { RecordingEventBase, type RecordingEventBaseOptions } from './events/recording-event-base';
import { type SceneEvent } from './events/scene-event';
import { RecordingSplit, createRecordingSplits } from './recording-splits';

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
    | ModdingInfoEvent;

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
    public frameEndEvents: FrameEndEvent[];
    public splits: RecordingSplit[];

    constructor(
        events: RecordingEvent[],
        unknownEvents: number,
        parsingErrors: number,
        public readonly lastPlayerDataEventsByField: Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>,
        public readonly allModVersions: ModInfo[],
    ) {
        super(events, unknownEvents, parsingErrors, null);

        for (const event of events) {
            if (event instanceof PlayerDataEvent) {
                const eventsOfField = this.playerDataEventsPerField.get(event.field) ?? [];
                eventsOfField.push(event);
                this.playerDataEventsPerField.set(event.field, eventsOfField);
            }
        }

        this.frameEndEvents = this.events.filter((it): it is FrameEndEvent => it instanceof FrameEndEvent);
        this.splits = createRecordingSplits(this);
    }

    lastPlayerDataEventOfField<TField extends PlayerDataField>(field: TField): PlayerDataEvent<TField> | null {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        return (this.lastPlayerDataEventsByField.get(field) as any) ?? null;
    }

    allPlayerDataEventsOfField<TField extends PlayerDataField>(field: TField): PlayerDataEvent<TField>[] {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        return (this.playerDataEventsPerField.get(field) as any) ?? [];
    }
}
