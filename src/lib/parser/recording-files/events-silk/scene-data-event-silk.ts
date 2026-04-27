import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export type SceneDataEventType = 'bool' | 'int' | 'geoRock';
export type SceneDataEventValue<TType extends SceneDataEventType> = TType extends 'bool'
	? boolean
	: TType extends 'int'
		? number
		: TType extends 'geoRock'
			? number
			: never;

export class SceneDataEventSilk<TType extends SceneDataEventType> extends RecordingEventBase {
	public previousSceneDataEventOfField: SceneDataEventSilk<TType> | null;
	public eventType: TType;
	public sceneName: string;
	public fieldName: string;
	public value: SceneDataEventValue<TType>;

	constructor(
		previousSceneDataEventOfField: SceneDataEventSilk<TType> | null,
		eventType: TType,
		sceneName: string,
		fieldName: string,
		value: SceneDataEventValue<TType>,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousSceneDataEventOfField = previousSceneDataEventOfField;
		this.eventType = eventType;
		this.sceneName = sceneName;
		this.fieldName = fieldName;
		this.value = value;
	}
}
