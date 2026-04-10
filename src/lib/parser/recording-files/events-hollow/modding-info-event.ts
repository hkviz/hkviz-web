import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export interface ModInfo {
	name: string;
	versions: string[];
	enabled?: boolean;
	errorCode?: string;
}

export class ModdingInfoEvent extends RecordingEventBase {
	public mods: ModInfo[];

	constructor(mods: ModInfo[], options: EventCreationContext) {
		super(options);
		this.mods = mods;
	}
}
