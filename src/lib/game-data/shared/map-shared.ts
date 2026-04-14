import * as d3 from 'd3';
import { GameId } from '~/lib/types/game-ids';
import { Bounds } from './bounds';

export interface RoomDataBase<Game extends GameId> {
	game: Game;

	sceneName: string;
	sceneNameForVisited: string;

	gameObjectName: string;

	roomNameFormatted: string;
	roomNameFormattedZoneExclusive: string;

	origColor: d3.HSLColor;
	zoneNameFormatted: string;

	isMainGameObject: boolean;

	visualBoundsAllSprites: Bounds | null; // probably shouldn't be null
}
