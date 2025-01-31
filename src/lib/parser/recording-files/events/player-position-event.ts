import { type Vector2 } from '../../hk-types';
import { playerPositionToMapPosition } from '../../map-data/player-position';
import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';
import { type SceneEvent } from './scene-event';

type PlayerPositionEventOptions = RecordingEventBaseOptions & Pick<PlayerPositionEvent, 'position' | 'sceneEvent'>;
export class PlayerPositionEvent extends RecordingEventBase {
    public position: Vector2;
    public sceneEvent: SceneEvent;
    public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

    public mapPosition: Vector2 | null = null;
    public previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
    public mapDistanceToPrevious: number | null = null;

    constructor(options: PlayerPositionEventOptions) {
        super(options);
        this.position = options.position;
        this.sceneEvent = options.sceneEvent;
    }

    calcMapPosition() {
        this.mapPosition = playerPositionToMapPosition(this.position, this.sceneEvent) ?? null;
    }
}
