import { Bounds } from '~/lib/game-data/shared/bounds';
import { mapRoomsHollow } from '../../game-data/hollow-data/map-data-hollow';

export const mapVisualExtends = Bounds.fromContainingBounds(mapRoomsHollow.map((r) => r.visualBounds));
