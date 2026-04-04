import { Vector2Like, Vector4Like } from '../shared/vector-like';

export interface RoomDataConditional {
	conditionalOn: string[];
	name: string;
	size: Vector2Like;
	padding: Vector4Like;
}
