import { Bounds } from '../types/bounds';
import { roomData } from './rooms';

export const mapVisualExtends = Bounds.fromContainingBounds(roomData.map(r => r.visualBounds));
