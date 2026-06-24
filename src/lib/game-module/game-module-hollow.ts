import { aggregateRecordingHollow } from '../aggregation/aggregate-recording-hollow';
import { EMPTY_AGGREGATION_HOLLOW } from '../aggregation/aggregation-value-hollow';
import type { AggregationVariable } from '../aggregation/aggregation-variable';
import { aggregationVariableInfosHollow } from '../aggregation/aggregation-variable-info-hollow';
import { hollowScale } from '../game-data/hollow-data/hollow-scaling';
import {
	allRoomDataBySceneNameHollow,
	allRoomDataIncludingSubspritesBySceneNameHollow,
	mainRoomDataBySceneNameHollow,
	mapRoomsHollow,
	roomDataByGameObjectNameHollow,
} from '../game-data/hollow-data/map-data-hollow';
import { mapVisualExtendsHollow } from '../game-data/hollow-data/map-extends-hollow';
import { getDefaultPlayerDataValueHollow, playerDataFieldsHollow } from '../game-data/hollow-data/player-data-hollow';
import { playerPositionToMapPositionHollow } from '../game-data/hollow-data/player-position-hollow';
import { areaNamesHollow } from '../game-data/hollow-data/text-data-hollow';
import { combineRecordingsHollow } from '../parser/recording-files/parser-hollow/combine-recordings-hollow';
import { parseRecordingFileHollow } from '../parser/recording-files/parser-hollow/parse-recording-file-hollow';
import { splitGroupsArrayHollow } from '../splits/splits-hollow/split-group-hollow';
import type { GameModule } from './game-module';

export const gameModuleHollow: GameModule<'hollow'> = {
	game: 'hollow',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.text();
		return parseRecordingFileHollow(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsHollow,

	map: {
		scale: hollowScale,
		rooms: mapRoomsHollow,
		areaTexts: areaNamesHollow,
		extends: mapVisualExtendsHollow,

		getMainRoomDataBySceneName: (sceneName) => mainRoomDataBySceneNameHollow.get(sceneName),
		getAllRoomDataBySceneNameNoSubSprites: (sceneName) => allRoomDataBySceneNameHollow.get(sceneName),
		getAllRoomDataBySceneNameWithSubSprites: (sceneName) =>
			allRoomDataIncludingSubspritesBySceneNameHollow.get(sceneName),
		getRoomDataByGameObjectName: (gameObjectName) => {
			return roomDataByGameObjectNameHollow.get(gameObjectName);
		},

		positionToMap: playerPositionToMapPositionHollow,
	},
	playerDataFields: {
		getDefaultValue: getDefaultPlayerDataValueHollow,
		byFieldName: playerDataFieldsHollow.byFieldName,
		list: playerDataFieldsHollow.list,
	},

	aggregation: {
		fromRecording: aggregateRecordingHollow,
		variableInfos: aggregationVariableInfosHollow,
		variables: Object.keys(aggregationVariableInfosHollow) as AggregationVariable[],
		DEFAULT_VALUES: EMPTY_AGGREGATION_HOLLOW,
	},

	splitGroups: splitGroupsArrayHollow,
};
