import { EMPTY_AGGREGATION_HOLLOW } from '../aggregation/aggregation-value-hollow';
import { AggregationVariable } from '../aggregation/aggregation-variable';
import { aggregationVariableInfosHollow } from '../aggregation/aggregation-variable-info-hollow';
import { playerDataFieldsHollow } from '../parser';
import {
	allRoomDataBySceneName as allRoomDataBySceneNameHollow,
	allRoomDataIncludingSubspritesBySceneName as allRoomDataIncludingSubspritesBySceneNameHollow,
	mainRoomDataBySceneName,
	mapRoomsHollow,
	playerPositionToMapPositionHollow,
	roomDataByGameObjectName,
} from '../parser/map-data';
import { combineRecordingsHollow } from '../parser/recording-files';
import { parseRecordingFileHollow } from '../parser/recording-files/parser-hollow/parse-recording-file-hollow';
import { GameModule } from './game-module';

export const gameModuleHollow: GameModule<'hollow'> = {
	game: 'hollow',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.text();
		return parseRecordingFileHollow(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsHollow,
	positionToMap: playerPositionToMapPositionHollow,
	getMainRoomDataBySceneName: (sceneName) => mainRoomDataBySceneName.get(sceneName),
	getAllRoomDataBySceneNameNoSubSprites: (sceneName) => allRoomDataBySceneNameHollow.get(sceneName),
	getAllRoomDataBySceneNameWithSubSprites: (sceneName) =>
		allRoomDataIncludingSubspritesBySceneNameHollow.get(sceneName),
	getRoomDataByGameObjectName: (gameObjectName) => {
		return roomDataByGameObjectName.get(gameObjectName);
	},
	mapRooms: mapRoomsHollow,
	playerDataFields: {
		byFieldName: playerDataFieldsHollow.byFieldName,
		list: playerDataFieldsHollow.list,
	},

	aggregation: {
		variableInfos: aggregationVariableInfosHollow,
		variables: Object.keys(aggregationVariableInfosHollow) as AggregationVariable[],
		DEFAULT_VALUES: EMPTY_AGGREGATION_HOLLOW,
	},
};
