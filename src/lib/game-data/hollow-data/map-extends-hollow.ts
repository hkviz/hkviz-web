import { Bounds } from '~/lib/game-data/shared/bounds';
import { mapRoomsHollow } from './map-data-hollow';
import { raise } from '~/lib/util/other';

export const mapVisualExtendsHollow =
	Bounds.fromContainingBoundsOf(mapRoomsHollow, (r) => r.visualBounds) ??
	raise(new Error('Map data must have at least one room with visual bounds'));
