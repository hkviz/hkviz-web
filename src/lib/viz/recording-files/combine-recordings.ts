import { raise } from '~/lib/utils';
import { PlayerDataField } from '../player-data/player-data';
import {
    HeroStateEvent,
    ParsedRecording,
    PlayerDataEvent,
    RecordingFileVersionEvent,
    isPlayerDataEventWithFieldType,
    type RecordingEvent,
    CombinedRecording,
} from './recording';

export function combineRecordings(recordings: ParsedRecording[]): CombinedRecording {
    const events: RecordingEvent[] = [];
    let msIntoGame = 0;
    let lastTimestamp: number =
        recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

    let isPaused = true;

    const previousPlayerDataEventsByField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>();

    for (const recording of recordings.sort((a, b) => a.partNumber! - b.partNumber!)) {
        for (const event of recording.events) {
            // msIntoGame calculation
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

            // previousPlayerDataEventsByField
            if (event instanceof PlayerDataEvent) {
                event.previousPlayerDataEventOfField = previousPlayerDataEventsByField.get(event.field) ?? null;
                previousPlayerDataEventsByField.set(event.field, event);
                if (isPlayerDataEventWithFieldType(event, 'List`1')) {
                    event.value = event.value.flatMap((it) =>
                        it === '::' ? event.previousPlayerDataEventOfField?.value ?? [] : [it],
                    );
                }
            }

            events.push(event);
        }
    }

    console.log(events);

    return new CombinedRecording(
        events,
        recordings.reduce((sum, recording) => sum + recording.unknownEvents, 0),
        recordings.reduce((sum, recording) => sum + recording.parsingErrors, 0),
        null,
        previousPlayerDataEventsByField,
    );
}
