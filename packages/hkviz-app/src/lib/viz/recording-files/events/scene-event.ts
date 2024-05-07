import { type BossSequenceData } from '../../player-data/boss-sequence';
import { type Vector2 } from '../../types/vector2';
import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';

type SceneEventOptions = RecordingEventBaseOptions & Pick<SceneEvent, 'sceneName' | 'originOffset' | 'sceneSize'>;
export class SceneEvent extends RecordingEventBase {
    public sceneName: string;
    public originOffset: Vector2 | undefined;
    public sceneSize: Vector2 | undefined;
    public currentBossSequence: BossSequenceData | null = null;
    public previousSceneEvent: SceneEvent | null = null;

    constructor(options: SceneEventOptions) {
        super(options);
        this.sceneName = options.sceneName;
        this.originOffset = options.originOffset;
        this.sceneSize = options.sceneSize;
    }

    getMainVirtualSceneName(): string {
        return this.currentBossSequence
            ? `boss_seq:${this.currentBossSequence.name}:${this.sceneName}`
            : this.sceneName;
    }
}
