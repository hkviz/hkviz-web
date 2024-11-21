import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';

export type HKVizModVersionEventOptions = RecordingEventBaseOptions & Pick<HKVizModVersionEvent, 'version'>;
export class HKVizModVersionEvent extends RecordingEventBase {
    public version: string;

    constructor(options: HKVizModVersionEventOptions) {
        super(options);
        this.version = options.version;
    }
}
