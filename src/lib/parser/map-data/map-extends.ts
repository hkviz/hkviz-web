import { roomData } from './rooms';
import { Bounds } from '../hk-types';

export const mapVisualExtends = Bounds.fromContainingBounds(roomData.map((r) => r.visualBounds));
