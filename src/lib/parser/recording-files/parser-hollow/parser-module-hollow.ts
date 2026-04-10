import { playerPositionToMapPositionHollow } from '../../map-data';
import { ParserModule } from '../parser-shared/parser-module';
import { combineRecordingsHollow } from './combine-recordings-hollow';
import { parseRecordingFileHollow } from './parse-recording-file-hollow';

export const parserModuleHollow: ParserModule<'hollow'> = {
	game: 'hollow',
	parseRecordingFile: async (response: Response, combinedPartNumber: number) => {
		const recordingFileContent = await response.text();
		return parseRecordingFileHollow(recordingFileContent, combinedPartNumber);
	},
	combineRecordings: combineRecordingsHollow,
	positionToMap: playerPositionToMapPositionHollow,
};
