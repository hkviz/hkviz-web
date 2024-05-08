import { Bounds } from '@hkviz/parser';
import { roomData } from './rooms';

export const mapVisualExtends = Bounds.fromContainingBounds(roomData.map((r) => r.visualBounds));
