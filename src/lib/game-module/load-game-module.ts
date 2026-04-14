import { GameId } from '~/lib/types/game-ids';
import { assertNever } from '../util';
import { GameModuleOfGame } from './game-module';

export async function loadGameModule<Game extends GameId>(game: Game): Promise<GameModuleOfGame<Game>> {
	switch (game) {
		case 'hollow':
			return (await import('./game-module-hollow')).gameModuleHollow as GameModuleOfGame<Game>;
		case 'silk':
			return (await import('./game-module-silk')).gameModuleSilk as GameModuleOfGame<Game>;
		default:
			return assertNever(game);
	}
}
