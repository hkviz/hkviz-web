import { Vector2 } from '~/lib/game-data/shared/vectors';
import { playerPositionToMapPosition } from '../../map-data/player-position';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { type SceneEvent } from './scene-event';

export class PlayerPositionEvent extends RecordingEventBase {
	public position: Vector2;
	public sceneEvent: SceneEvent;
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	public mapPosition: Vector2 | null = null;
	public previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
	public mapDistanceToPrevious: number | null = null;

	constructor(position: Vector2, sceneEvent: SceneEvent, ctx: EventCreationContext) {
		super(ctx);
		this.position = position;
		this.sceneEvent = sceneEvent;
	}

	calcMapPosition() {
		this.mapPosition = playerPositionToMapPosition(this.position, this.sceneEvent) ?? null;
	}
}
