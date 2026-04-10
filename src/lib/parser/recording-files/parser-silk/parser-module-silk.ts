import { playerPositionToMapPositionSilk } from '~/lib/game-data/silk-data/player-position-silk';
import { ParserModule } from '../parser-shared/parser-module';
import { combineRecordingsSilk } from './combine-recordings-silk';
import { parseRecordingFileSilk } from './parse-recording-file-silk';

export const parserModuleSilk: ParserModule<'silk'> = {
	game: 'silk',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.arrayBuffer();
		return parseRecordingFileSilk(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsSilk,
	positionToMap: playerPositionToMapPositionSilk,
};
