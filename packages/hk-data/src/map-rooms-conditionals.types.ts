import { type Vector2Like, type Vector4Like } from './types';

export interface RoomDataConditional {
    conditionalOn: string[];
    name: string;
    size: Vector2Like;
    padding: Vector4Like;
}
