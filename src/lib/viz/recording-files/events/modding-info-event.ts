import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';

export interface ModInfo {
    name: string;
    versions: string[];
}

export type ModdingInfoEventOptions = RecordingEventBaseOptions & Pick<ModdingInfoEvent, 'mods'>;
export class ModdingInfoEvent extends RecordingEventBase {
    public mods: ModInfo[];

    constructor(options: ModdingInfoEventOptions) {
        super(options);
        this.mods = options.mods;
    }
}
