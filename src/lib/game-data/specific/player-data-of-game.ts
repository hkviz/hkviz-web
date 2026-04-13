import type { PlayerDataFieldHollow, playerDataFieldsHollow } from '../hollow-data/player-data-hollow';
import type { playerDataFieldsSilk } from '../silk-data/player-data-silk';
import { PlayerDataFieldSilk } from '../silk-data/player-data-silk.generated';

export type PlayerDataFieldAny = PlayerDataFieldHollow | PlayerDataFieldSilk;

export type PlayerDataFieldOfGame<Game extends string> = Game extends 'hollow'
	? PlayerDataFieldHollow
	: Game extends 'silk'
		? PlayerDataFieldSilk
		: PlayerDataFieldAny;

export type PlayerDataFieldByNameAny =
	| typeof playerDataFieldsHollow.byFieldName
	| typeof playerDataFieldsSilk.byFieldName;
export type PlayerDataFieldByNameOfGame<Game extends string> = Game extends 'hollow'
	? typeof playerDataFieldsHollow.byFieldName
	: Game extends 'silk'
		? typeof playerDataFieldsSilk.byFieldName
		: PlayerDataFieldByNameAny;
