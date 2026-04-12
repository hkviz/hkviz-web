import {
	silkMapData,
	silkMapDataAllBySceneNameLower,
	silkMapDataBySceneNameLower,
} from '~/lib/game-data/silk-data/map-data-silk';
import { playerPositionToMapPositionSilk } from '~/lib/game-data/silk-data/player-position-silk';
import { combineRecordingsSilk } from '../recording-files/parser-silk/combine-recordings-silk';
import { parseRecordingFileSilk } from '../recording-files/parser-silk/parse-recording-file-silk';
import { GameModule } from './game-module';

export const gameModuleSilk: GameModule<'silk'> = {
	game: 'silk',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.arrayBuffer();
		return parseRecordingFileSilk(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsSilk,
	positionToMap: playerPositionToMapPositionSilk,
	getMainRoomDataBySceneName: (sceneName) => silkMapDataBySceneNameLower.get(sceneName.toLocaleLowerCase()),
	getAllRoomDataBySceneNameNoSubSprites: (sceneName) =>
		silkMapDataAllBySceneNameLower.get(sceneName.toLocaleLowerCase()),
	getAllRoomDataBySceneNameWithSubSprites: (sceneName) =>
		// currently subsprites not implemented in silk
		silkMapDataAllBySceneNameLower.get(sceneName.toLocaleLowerCase()),
	mapRooms: silkMapData.rooms,
};
