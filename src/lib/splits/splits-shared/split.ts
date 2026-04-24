import { PlayerPositionEvent } from '~/lib/parser/recording-files/events-shared/player-position-event';
import { LocalizedString } from '~/lib/viz/store/localization-store';
import { SplitGroup } from './split-group';

export interface Split {
	msIntoGame: number;
	title: LocalizedString;
	subtitle?: LocalizedString;
	tooltip: string;
	imageUrl: string | undefined;
	group: SplitGroup;
	debugInfo: unknown;
	previousPlayerPositionEvent: PlayerPositionEvent | null;
	imageStyle?: 'rounded-border';
}
