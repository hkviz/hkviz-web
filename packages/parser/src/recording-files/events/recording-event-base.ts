
export type RecordingEventBaseOptions = Pick<RecordingEventBase, 'timestamp'> &
    Partial<Pick<RecordingEventBase, 'msIntoGame'>>;
export abstract class RecordingEventBase {
    timestamp: number;
    msIntoGame = 0;
    constructor(options: RecordingEventBaseOptions) {
        this.timestamp = options.timestamp;
        if (options.msIntoGame != null) {
            this.msIntoGame = options.msIntoGame;
        }
    }
}