import type * as d3 from 'd3';
import type { GameId } from '~/lib/types/game-ids';
import type { Bounds } from './bounds';
import type { LocalizedString } from '~/lib/viz/store/localization-store';

export interface RoomDataBase<Game extends GameId = GameId> {
	game: Game;

	sceneName: string;
	sceneNameForVisited: string;

	gameObjectName: string;

	roomNameFormatted: string;
	roomNameFormattedZoneExclusive: string;

	origColor: d3.HSLColor;
	zoneNameFormatted: string;
	zoneName: LocalizedString;
	zoomZones: string[];

	isMainGameObject: boolean;

	visualBoundsAllSprites: Bounds | null;
}
