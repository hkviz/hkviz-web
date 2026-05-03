import type { Vector2 } from '~/lib/game-data/shared/vectors';
import type { RoomDataOfGame } from '~/lib/game-data/specific/room-data-of-game';
import type { GameId } from '~/lib/types/game-ids';
import type { AggregationValueOfGame } from '../aggregation/aggregation-value-specific';
import type { AggregationVariable } from '../aggregation/aggregation-variable';
import type { AggregationVariableInfo } from '../aggregation/aggregation-variable-info-shared';
import type { Bounds } from '../game-data/shared/bounds';
import type { MapTextData } from '../game-data/shared/map-text-data';
import type {
	PlayerDataFieldByNameOfGame,
	PlayerDataFieldNameOfGame,
	PlayerDataFieldOfGame,
	PlayerDataFieldValueOfGame,
} from '../game-data/specific/player-data-of-game';
import type { SceneEvent } from '../parser/recording-files/events-shared/scene-event';
import type { CombinedRecordingOfGame } from '../parser/recording-files/parser-specific/combined-recording';
import type { ParsedRecordingOfGame } from '../parser/recording-files/parser-specific/parsed-recording-of-game';
import type { SplitGroup } from '../splits/splits-shared/split-group';

export interface GameModule<Game extends GameId> {
	game: Game;
	parseRecordingFile: (response: Response, combinedPartNumber: number) => Promise<ParsedRecordingOfGame<Game>>;
	combineRecordings: (recordings: ParsedRecordingOfGame<Game>[]) => CombinedRecordingOfGame<Game>;
	map: {
		scale: (gameUnits: number) => number;

		rooms: RoomDataOfGame<Game>[];
		areaTexts: MapTextData[];
		extends: Bounds;

		getMainRoomDataBySceneName: (sceneName: string) => RoomDataOfGame<Game> | undefined;
		getAllRoomDataBySceneNameNoSubSprites: (sceneName: string) => RoomDataOfGame<Game>[] | undefined;
		getAllRoomDataBySceneNameWithSubSprites: (sceneName: string) => RoomDataOfGame<Game>[] | undefined;
		getRoomDataByGameObjectName: (gameObjectName: string) => RoomDataOfGame<Game> | undefined;

		positionToMap: (playerPosition: Vector2, sceneEvent: SceneEvent | undefined) => Vector2 | undefined;
	};
	playerDataFields: {
		byFieldName: PlayerDataFieldByNameOfGame<Game>;
		list: PlayerDataFieldOfGame<Game>[];
		getDefaultValue<TField extends PlayerDataFieldNameOfGame<Game>>(
			fieldName: TField,
		): PlayerDataFieldValueOfGame<Game, TField> | null;
	};
	aggregation: {
		variableInfos: Record<AggregationVariable, AggregationVariableInfo>;
		variables: AggregationVariable[];
		DEFAULT_VALUES: AggregationValueOfGame<Game>;
	};
	splitGroups: SplitGroup[];
}

export type GameModuleAny = GameModule<'hollow'> | GameModule<'silk'>;

export type GameModuleOfGame<Game extends GameId> = Game extends 'hollow'
	? GameModule<'hollow'>
	: Game extends 'silk'
		? GameModule<'silk'>
		: GameModuleAny;
