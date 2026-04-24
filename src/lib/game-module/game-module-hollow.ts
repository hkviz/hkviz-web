import { EMPTY_AGGREGATION_HOLLOW } from '../aggregation/aggregation-value-hollow';
import { AggregationVariable } from '../aggregation/aggregation-variable';
import { aggregationVariableInfosHollow } from '../aggregation/aggregation-variable-info-hollow';
import { playerDataFieldsHollow } from '../parser';
import {
	allRoomDataBySceneName as allRoomDataBySceneNameHollow,
	allRoomDataIncludingSubspritesBySceneName as allRoomDataIncludingSubspritesBySceneNameHollow,
	areaNamesHollow,
	mainRoomDataBySceneName,
	mapRoomsHollow,
	mapVisualExtends,
	playerPositionToMapPositionHollow,
	roomDataByGameObjectName,
} from '../parser/map-data';
import { combineRecordingsHollow } from '../parser/recording-files';
import { parseRecordingFileHollow } from '../parser/recording-files/parser-hollow/parse-recording-file-hollow';
import { splitGroupsArrayHollow } from '../splits/splits-hollow/split-group-hollow';
import { GameModule } from './game-module';

export const gameModuleHollow: GameModule<'hollow'> = {
	game: 'hollow',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.text();
		return parseRecordingFileHollow(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsHollow,

	map: {
		rooms: mapRoomsHollow,
		areaTexts: areaNamesHollow,
		extends: mapVisualExtends,

		getMainRoomDataBySceneName: (sceneName) => mainRoomDataBySceneName.get(sceneName),
		getAllRoomDataBySceneNameNoSubSprites: (sceneName) => allRoomDataBySceneNameHollow.get(sceneName),
		getAllRoomDataBySceneNameWithSubSprites: (sceneName) =>
			allRoomDataIncludingSubspritesBySceneNameHollow.get(sceneName),
		getRoomDataByGameObjectName: (gameObjectName) => {
			return roomDataByGameObjectName.get(gameObjectName);
		},

		positionToMap: playerPositionToMapPositionHollow,
	},
	playerDataFields: {
		byFieldName: playerDataFieldsHollow.byFieldName,
		list: playerDataFieldsHollow.list,
	},

	aggregation: {
		variableInfos: aggregationVariableInfosHollow,
		variables: Object.keys(aggregationVariableInfosHollow) as AggregationVariable[],
		DEFAULT_VALUES: EMPTY_AGGREGATION_HOLLOW,
	},

	splitGroups: splitGroupsArrayHollow,
};
