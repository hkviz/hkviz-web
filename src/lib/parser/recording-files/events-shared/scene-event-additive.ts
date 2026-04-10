import { EventCreationContext } from './event-creation-context';
import { RecordingEventBase } from './recording-event-base';
import { SceneEvent } from './scene-event';

export class SceneEventAdditive extends RecordingEventBase {
	public sceneName: string;
	public previousSceneEvent: SceneEvent | null = null;

	constructor(sceneName: string, ctx: EventCreationContext) {
		super(ctx);
		this.sceneName = sceneName;
	}
}
