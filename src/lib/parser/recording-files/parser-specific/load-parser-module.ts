import { GameId } from '~/lib/types/game-ids';
import { assertNever } from '../../util';
import { ParserModule } from '../parser-shared/parser-module';

export async function loadParserModule<Game extends GameId>(game: Game): Promise<ParserModule<Game>> {
	switch (game) {
		case 'hollow':
			return (await import('../parser-hollow/parser-module-hollow')).parserModuleHollow as ParserModule<Game>;
		case 'silk':
			return (await import('../parser-silk/parser-module-silk')).parserModuleSilk as ParserModule<Game>;
		default:
			assertNever(game);
	}
}
