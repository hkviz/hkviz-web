import {
	mapDataAllBySceneNameSilk,
	mapDataByGameObjectNameSilk,
	mapDataBySceneNameSilk,
	silkMapData,
} from '~/lib/game-data/silk-data/map-data-silk';
import { playerPositionToMapPositionSilk } from '~/lib/game-data/silk-data/player-position-silk';
import { EMPTY_AGGREGATION_SILK } from '../aggregation/aggregation-value-silk';
import { AggregationVariable } from '../aggregation/aggregation-variable';
import { aggregationVariableInfosSilk } from '../aggregation/aggregation-variable-info-silk';
import { playerDataFieldsSilk } from '../game-data/silk-data/player-data-silk';
import { combineRecordingsSilk } from '../parser/recording-files/parser-silk/combine-recordings-silk';
import { parseRecordingFileSilk } from '../parser/recording-files/parser-silk/parse-recording-file-silk';
import { GameModule } from './game-module';

export const gameModuleSilk: GameModule<'silk'> = {
	game: 'silk',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.arrayBuffer();
		return parseRecordingFileSilk(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsSilk,
	positionToMap: playerPositionToMapPositionSilk,
	getMainRoomDataBySceneName: (sceneName) => mapDataBySceneNameSilk.get(sceneName),
	getAllRoomDataBySceneNameNoSubSprites: (sceneName) => mapDataAllBySceneNameSilk.get(sceneName),
	getAllRoomDataBySceneNameWithSubSprites: (sceneName) =>
		// currently subsprites not implemented in silk
		mapDataAllBySceneNameSilk.get(sceneName),
	getRoomDataByGameObjectName: (gameObjectName) => {
		return mapDataByGameObjectNameSilk.get(gameObjectName);
	},
	mapRooms: silkMapData.rooms,
	playerDataFields: {
		byFieldName: playerDataFieldsSilk.byFieldName,
		list: playerDataFieldsSilk.list,
	},

	aggregation: {
		variableInfos: aggregationVariableInfosSilk,
		variables: Object.keys(aggregationVariableInfosSilk) as AggregationVariable[],
		DEFAULT_VALUES: EMPTY_AGGREGATION_SILK,
	},
};
