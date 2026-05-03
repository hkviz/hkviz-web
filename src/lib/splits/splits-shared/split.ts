import type { PlayerPositionEvent } from '~/lib/parser/recording-files/events-shared/player-position-event';
import type { LocalizedString } from '~/lib/viz/store/localization-store';
import type { SplitGroup } from './split-group';

export interface Split {
	msIntoGame: number;
	title: LocalizedString;
	subtitle?: LocalizedString;
	tooltip: LocalizedString;
	imageUrl: string | undefined;
	group: SplitGroup;
	debugInfo: unknown;
	previousPlayerPositionEvent: PlayerPositionEvent | null;
	imageStyle?: 'rounded-border';
}
