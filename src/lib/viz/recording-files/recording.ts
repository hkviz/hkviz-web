import { raise } from '~/lib/utils';
import { type PlayerDataField } from '../player-data/player-data';
import type { Vector2 } from '../types/vector2';
import { HeroStateField } from '../hero-state/hero-states';
import { playerPositionToMapPosition } from '../map-data/player-position';

type RecordingEventBaseOptions = Pick<RecordingEventBase, 'timestamp'>;
abstract class RecordingEventBase {
    timestamp: number;
    msIntoGame = 0;
    constructor(options: RecordingEventBaseOptions) {
        this.timestamp = options.timestamp;
    }
}

type RecordingFileVersionEventOptions = RecordingEventBaseOptions & Pick<RecordingFileVersionEvent, 'version'>;
export class RecordingFileVersionEvent extends RecordingEventBase {
    public version: string;

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

type PlayerPositionEventOptions = RecordingEventBaseOptions &
    Pick<PlayerPositionEvent, 'position' | 'sceneEvent' | 'previousPlayerPositionEvent'>;
export class PlayerPositionEvent extends RecordingEventBase {
    public position: Vector2;
    public sceneEvent: SceneEvent;
    public previousPlayerPositionEvent: PlayerPositionEvent | null;

    public mapPosition: Vector2 | null;
    public previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null;

    constructor(options: PlayerPositionEventOptions) {
        super(options);
        this.position = options.position;
        this.sceneEvent = options.sceneEvent;
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;

        this.mapPosition = playerPositionToMapPosition(this.position, this.sceneEvent) ?? null;
        this.previousPlayerPositionEventWithMapPosition = this.previousPlayerPositionEvent?.mapPosition
            ? this.previousPlayerPositionEvent
            : this.previousPlayerPositionEvent?.previousPlayerPositionEventWithMapPosition ?? null;
    }
}

type PlayerDataEventOptions = RecordingEventBaseOptions &
    Pick<PlayerDataEvent, 'field' | 'value' | 'previousPlayerPositionEvent'>;
export class PlayerDataEvent extends RecordingEventBase {
    public readonly previousPlayerPositionEvent: PlayerPositionEvent | null = null;
    public readonly field: PlayerDataField;
    public readonly value: string;

    constructor(options: PlayerDataEventOptions) {
        super(options);
        this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
        this.field = options.field;
        this.value = options.value;
    }
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

export type RecordingEvent =
    | SceneEvent
    | PlayerPositionEvent
    | PlayerDataEvent
    | RecordingFileVersionEvent
    | HeroStateEvent;

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
