import { raise } from '~/lib/utils';
import { ParsedRecording, RecordingFileVersionEvent, type RecordingEvent, HeroStateEvent } from './recording';

export function combineRecordings(recordings: ParsedRecording[]): ParsedRecording {
    console.log({ recordings });
    const events: RecordingEvent[] = [];
    let msIntoGame = 0;
    let lastTimestamp: number =
        recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

    let isPaused = true;

    for (const recording of recordings.sort((a, b) => a.partNumber! - b.partNumber!)) {
        for (const event of recording.events) {
            if (event instanceof RecordingFileVersionEvent) {
                // time before the previous event and this event is not counted,
                // since either the session just started again, or pause has been active, or a scene has been loaded
                // TODO add remaining event checks
                console.log('time between sessions not counted', event.timestamp - lastTimestamp);
                lastTimestamp = event.timestamp;
                isPaused = false;
            } else if (event instanceof HeroStateEvent && event.field.name === 'isPaused') {
                isPaused = event.value;
                if (!isPaused) {
                    lastTimestamp = event.timestamp;
                }
            } else {
                if (!isPaused) {
                    msIntoGame += event.timestamp - lastTimestamp;
                }
                lastTimestamp = event.timestamp;
            }

            event.msIntoGame = msIntoGame;
            events.push(event);
        }
    }

    console.log(events);

    return new ParsedRecording(
        events,
        recordings.reduce((sum, recording) => sum + recording.unknownEvents, 0),
        recordings.reduce((sum, recording) => sum + recording.parsingErrors, 0),
        null,
    );
}
