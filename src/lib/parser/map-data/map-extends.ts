import { Bounds } from '~/lib/game-data/shared/bounds';
import { roomData } from './rooms';

export const mapVisualExtends = Bounds.fromContainingBounds(roomData.map((r) => r.visualBounds));
