import { Bounds } from '~/lib/game-data/shared/bounds';
import { mapRoomsHollow } from './map-data-hollow';

export const mapVisualExtendsHollow = Bounds.fromContainingBounds(mapRoomsHollow.map((r) => r.visualBounds));
