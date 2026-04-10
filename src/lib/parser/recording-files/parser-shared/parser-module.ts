import { Vector2 } from '~/lib/game-data/shared/vectors';
import { GameId } from '~/lib/types/game-ids';
import { SceneEvent } from '../events-shared/scene-event';
import { CombinedRecordingOfGame } from '../parser-specific/combined-recording';
import { ParsedRecordingOfGame } from '../parser-specific/parsed-recording-of-game';

export interface ParserModule<Game extends GameId> {
	game: Game;
	parseRecordingFile: (response: Response, combinedPartNumber: number) => Promise<ParsedRecordingOfGame<Game>>;
	combineRecordings: (recordings: ParsedRecordingOfGame<Game>[]) => CombinedRecordingOfGame<Game>;
	positionToMap: (playerPosition: Vector2, sceneEvent: SceneEvent | undefined) => Vector2 | undefined;
}
