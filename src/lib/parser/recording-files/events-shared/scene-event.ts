import { Vector2 } from '~/lib/game-data/shared/vectors';
import { type BossSequenceData } from '../../player-data/boss-sequence';
import { EventCreationContext } from './event-creation-context';
import { RecordingEventBase } from './recording-event-base';

export class SceneEvent extends RecordingEventBase {
	public sceneName: string;
	public originOffset: Vector2 | undefined;
	public sceneSize: Vector2 | undefined;
	public currentBossSequence: BossSequenceData | null = null;
	public previousSceneEvent: SceneEvent | null = null;

	constructor(
		sceneName: string,
		originOffset: Vector2 | undefined,
		sceneSize: Vector2 | undefined,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.sceneName = sceneName;
		this.originOffset = originOffset;
		this.sceneSize = sceneSize;
	}

	getMainVirtualSceneName(): string {
		return this.currentBossSequence
			? `boss_seq:${this.currentBossSequence.name}:${this.sceneName}`
			: this.sceneName;
	}
}
