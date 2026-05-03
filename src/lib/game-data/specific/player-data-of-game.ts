import type { GameId } from '~/lib/types/game-ids';
import type {
	PlayerDataFieldHollow,
	PlayerDataFieldNameHollow,
	playerDataFieldsHollow,
	PlayerDataFieldValueHollow,
} from '../hollow-data/player-data-hollow';
import type { playerDataFieldsSilk } from '../silk-data/player-data-silk';
import type {
	PlayerDataFieldNameSilk,
	PlayerDataFieldSilk,
	PlayerDataFieldValueSilk,
} from '../silk-data/player-data-silk.generated';

export type PlayerDataFieldAny = PlayerDataFieldHollow | PlayerDataFieldSilk;

export type PlayerDataFieldOfGame<Game extends GameId> = Game extends 'hollow'
	? PlayerDataFieldHollow
	: Game extends 'silk'
		? PlayerDataFieldSilk
		: PlayerDataFieldAny;

export type PlayerDataFieldByNameAny =
	| typeof playerDataFieldsHollow.byFieldName
	| typeof playerDataFieldsSilk.byFieldName;
export type PlayerDataFieldByNameOfGame<Game extends GameId> = Game extends 'hollow'
	? typeof playerDataFieldsHollow.byFieldName
	: Game extends 'silk'
		? typeof playerDataFieldsSilk.byFieldName
		: PlayerDataFieldByNameAny;

export type PlayerDataFieldNameAny = PlayerDataFieldNameHollow | PlayerDataFieldNameSilk;
export type PlayerDataFieldNameOfGame<Game extends GameId> = Game extends 'hollow'
	? PlayerDataFieldNameHollow
	: Game extends 'silk'
		? PlayerDataFieldNameSilk
		: PlayerDataFieldNameAny;

export type PlayerDataFieldValueAny =
	| PlayerDataFieldValueHollow<PlayerDataFieldNameHollow>
	| PlayerDataFieldValueSilk<PlayerDataFieldNameSilk>;

export type PlayerDataFieldValueOfGame<
	Game extends GameId,
	TFieldName extends PlayerDataFieldNameOfGame<Game>,
> = Game extends 'hollow'
	? PlayerDataFieldValueHollow<TFieldName & PlayerDataFieldNameHollow>
	: Game extends 'silk'
		? PlayerDataFieldValueSilk<TFieldName & PlayerDataFieldNameSilk>
		: PlayerDataFieldValueAny;
