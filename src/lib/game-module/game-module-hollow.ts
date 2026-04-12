import {
	allRoomDataBySceneName as allRoomDataBySceneNameHollow,
	allRoomDataIncludingSubspritesBySceneName as allRoomDataIncludingSubspritesBySceneNameHollow,
	mainRoomDataBySceneName,
	mapRoomsHollow,
	playerPositionToMapPositionHollow,
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
	mapRooms: mapRoomsHollow,
};
