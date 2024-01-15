import { type Vector2 } from '../../types/vector2';
import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';

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
