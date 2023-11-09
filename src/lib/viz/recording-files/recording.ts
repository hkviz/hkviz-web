import { Vector2 } from '../types/vector2';

type RecordingEventBaseOptions = Pick<RecordingEventBase, 'timestamp'>;
abstract class RecordingEventBase {
	timestamp: number;
	constructor(options: RecordingEventBaseOptions) {
		this.timestamp = options.timestamp;
	}
}

type SceneEventOptions = RecordingEventBaseOptions & Pick<SceneEvent, 'sceneName' | 'originOffset' | 'sceneSize'>;
export class SceneEvent extends RecordingEventBase {
	public sceneName: string;
	public originOffset: Vector2|undefined;
	public sceneSize: Vector2|undefined;

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

	constructor(options: PlayerPositionEventOptions) {
		super(options);
		this.position = options.position;
		this.sceneEvent = options.sceneEvent;
	}
}

export type RecordingEvent = SceneEvent | PlayerPositionEvent;

export class Recording {
	constructor(
        public readonly sceneEvents: RecordingEvent[],
	) {}
}
