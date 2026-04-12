import {
	mapDataAllBySceneNameLowerSilk,
	mapDataByGameObjectNameSilk,
	mapDataBySceneNameLowerSilk,
	silkMapData,
} from '~/lib/game-data/silk-data/map-data-silk';
import { playerPositionToMapPositionSilk } from '~/lib/game-data/silk-data/player-position-silk';
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
	getMainRoomDataBySceneName: (sceneName) => mapDataBySceneNameLowerSilk.get(sceneName.toLocaleLowerCase()),
	getAllRoomDataBySceneNameNoSubSprites: (sceneName) =>
		mapDataAllBySceneNameLowerSilk.get(sceneName.toLocaleLowerCase()),
	getAllRoomDataBySceneNameWithSubSprites: (sceneName) =>
		// currently subsprites not implemented in silk
		mapDataAllBySceneNameLowerSilk.get(sceneName.toLocaleLowerCase()),
	getRoomDataByGameObjectName: (gameObjectName) => {
		return mapDataByGameObjectNameSilk.get(gameObjectName);
	},
	mapRooms: silkMapData.rooms,
};
