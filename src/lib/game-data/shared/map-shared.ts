import type * as d3 from 'd3';
import type { GameId } from '~/lib/types/game-ids';
import type { Bounds } from './bounds';

export interface RoomDataBase<Game extends GameId = GameId> {
	game: Game;

	sceneName: string;
	sceneNameForVisited: string;

	gameObjectName: string;

	roomNameFormatted: string;
	roomNameFormattedZoneExclusive: string;

	origColor: d3.HSLColor;
	zoneNameFormatted: string;
	zoomZones: string[];

	isMainGameObject: boolean;

	visualBoundsAllSprites: Bounds | null;
}
