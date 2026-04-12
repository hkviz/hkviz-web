import { Vector2 } from '~/lib/game-data/shared/vectors';
import { RoomDataOfGame } from '~/lib/game-data/specific/room-data-of-game';
import { GameId } from '~/lib/types/game-ids';
import { SceneEvent } from '../parser/recording-files/events-shared/scene-event';
import { CombinedRecordingOfGame } from '../parser/recording-files/parser-specific/combined-recording';
import { ParsedRecordingOfGame } from '../parser/recording-files/parser-specific/parsed-recording-of-game';

export interface GameModule<Game extends GameId> {
	game: Game;
	parseRecordingFile: (response: Response, combinedPartNumber: number) => Promise<ParsedRecordingOfGame<Game>>;
	combineRecordings: (recordings: ParsedRecordingOfGame<Game>[]) => CombinedRecordingOfGame<Game>;
	positionToMap: (playerPosition: Vector2, sceneEvent: SceneEvent | undefined) => Vector2 | undefined;
	getMainRoomDataBySceneName: (sceneName: string) => RoomDataOfGame<Game> | undefined;
	getAllRoomDataBySceneNameNoSubSprites: (sceneName: string) => RoomDataOfGame<Game>[] | undefined;
	getAllRoomDataBySceneNameWithSubSprites: (sceneName: string) => RoomDataOfGame<Game>[] | undefined;
	mapRooms: RoomDataOfGame<Game>[];
}

export type GameModuleAny = GameModule<'hollow'> | GameModule<'silk'>;

export type GameModuleOfGame<Game extends GameId> = Game extends 'hollow'
	? GameModule<'hollow'>
	: Game extends 'silk'
		? GameModule<'silk'>
		: GameModuleAny;
