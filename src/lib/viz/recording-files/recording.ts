import { raise } from '~/lib/utils/utils';
import { type HeroStateField } from '../hero-state/hero-states';
import { playerPositionToMapPosition } from '../map-data/player-position';
import { playerDataFields, type PlayerDataField, type PlayerDataFieldValue } from '../player-data/player-data';
import { type RecordingFileVersion } from '../types/recording-file-version';
import type { Vector2 } from '../types/vector2';

type RecordingEventBaseOptions = Pick<RecordingEventBase, 'timestamp'> &
    Partial<Pick<RecordingEventBase, 'msIntoGame'>>;
abstract class RecordingEventBase {
    timestamp: number;
    msIntoGame = 0;
    constructor(options: RecordingEventBaseOptions) {
        this.timestamp = options.timestamp;
        if (options.msIntoGame != null) {
            this.msIntoGame = options.msIntoGame;
        }
    }
}

type RecordingFileVersionEventOptions = RecordingEventBaseOptions & Pick<RecordingFileVersionEvent, 'version'>;
export class RecordingFileVersionEvent extends RecordingEventBase {
    public version: RecordingFileVersion;

    constructor(options: RecordingFileVersionEventOptions) {
        super(options);
        this.version = options.version;
    }
}

type SceneEventOptions = RecordingEventBaseOptions & Pick<SceneEvent, 'sceneName' | 'originOffset' | 'sceneSize'>;
export class SceneEvent extends RecordingEventBase {
    public sceneName: string;
    public originOffset: Vector2 | undefined;
    public sceneSize: Vector2 | undefined;

    constructor(options: SceneEventOptions) {
        super(options);
        this.sceneName = options.sceneName;
        this.originOffset = options.originOffset;
        this.sceneSize = options.sceneSize;
    }
}

type PlayerPositionEventOptions = RecordingEventBaseOptions & Pick<PlayerPositionEvent, 'position' | 'sceneEvent'>;
export class PlayerPositionEvent extends RecordingEventBase {
    public position: Vector2;
    public sceneEvent: SceneEvent;
    public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    public mapPosition: Vector2 | null;
    public previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
    public mapDistanceToPrevious: number | null = null;

    constructor(options: PlayerPositionEventOptions) {
        super(options);
        this.position = options.position;
        this.sceneEvent = options.sceneEvent;

        this.mapPosition = playerPositionToMapPosition(this.position, this.sceneEvent) ?? null;
    }
}

type PlayerDataEventOptions<TField extends PlayerDataField> = RecordingEventBaseOptions &
    Pick<PlayerDataEvent<TField>, 'field' | 'value' | 'previousPlayerPositionEvent' | 'previousPlayerDataEventOfField'>;
export class PlayerDataEvent<TField extends PlayerDataField> extends RecordingEventBase {
    public previousPlayerPositionEvent: PlayerPositionEvent | null;
    public previousPlayerDataEventOfField: PlayerDataEvent<TField> | null;
    public field: TField;
    public value: PlayerDataFieldValue<TField>;

    constructor(options: PlayerDataEventOptions<TField>) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
        this.field = options.field;
        this.value = options.value;
        this.previousPlayerDataEventOfField = options.previousPlayerDataEventOfField;
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
    public readonly previousPlayerPositionEvent: PlayerPositionEvent | null = null;
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
    public readonly previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    constructor(options: SpellFireballEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
    }
}

type SpellUpEventOptions = RecordingEventBaseOptions & Pick<SpellUpEvent, 'previousPlayerPositionEvent'>;
export class SpellUpEvent extends RecordingEventBase {
    public readonly previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    constructor(options: SpellUpEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
    }
}

type SpellDownEventOptions = RecordingEventBaseOptions & Pick<SpellDownEvent, 'previousPlayerPositionEvent'>;
export class SpellDownEvent extends RecordingEventBase {
    public readonly previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    constructor(options: SpellDownEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
    }
}

/**
 * Synthetic event / not actually recorded
 * created by recording combiner whenever the timestamp changes if any of the values in it changed
 */
type FrameEndEventOptions = Omit<FrameEndEvent, never>;
export class FrameEndEvent extends RecordingEventBase {
    geo: number;
    geoPool: number;

    constructor(options: FrameEndEventOptions) {
        super(options);
        this.geo = options.geo;
        this.geoPool = options.geoPool;
    }
}
export const frameEndEventPlayerDataFields = new Set<PlayerDataField>([
    playerDataFields.byFieldName.geo,
    playerDataFields.byFieldName.geoPool,
]);

export type RecordingEvent =
    | SceneEvent
    | PlayerPositionEvent
    | PlayerDataEvent<PlayerDataField>
    | RecordingFileVersionEvent
    | HeroStateEvent
    | SpellFireballEvent
    | SpellDownEvent
    | SpellUpEvent
    | FrameEndEvent;

export class ParsedRecording {
    constructor(
        public readonly events: RecordingEvent[],
        public readonly unknownEvents: number,
        public readonly parsingErrors: number,
        public readonly partNumber: number | null,
    ) {}

    lastEvent() {
        return (
            this.events[this.events.length - 1] ??
            raise(new Error(`Recording file ${this.partNumber} does not contain any events`))
        );
    }
    firstEvent() {
        return this.events[0] ?? raise(new Error(`Recording file ${this.partNumber} does not contain any events`));
    }
}

export class CombinedRecording extends ParsedRecording {
    public playerDataEventsPerField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>[]>();
    public frameEndEvents: FrameEndEvent[];

    constructor(
        events: RecordingEvent[],
        unknownEvents: number,
        parsingErrors: number,
        partNumber: number | null,
        public readonly lastPlayerDataEventsByField: Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>,
    ) {
        super(events, unknownEvents, parsingErrors, partNumber);

        for (const event of events) {
            if (event instanceof PlayerDataEvent) {
                const eventsOfField = this.playerDataEventsPerField.get(event.field) ?? [];
                eventsOfField.push(event);
                this.playerDataEventsPerField.set(event.field, eventsOfField);
            }
        }

        this.frameEndEvents = this.events.filter((it): it is FrameEndEvent => it instanceof FrameEndEvent);
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
