import { raise } from '~/lib/utils';
import { type PlayerDataField } from '../player-data/player-data';
import {
    CombinedRecording,
    HeroStateEvent,
    type ParsedRecording,
    PlayerDataEvent,
    RecordingFileVersionEvent,
    isPlayerDataEventWithFieldType,
    type RecordingEvent,
    PlayerPositionEvent,
} from './recording';

export function combineRecordings(recordings: ParsedRecording[]): CombinedRecording {
    const events: RecordingEvent[] = [];
    let msIntoGame = 0;
    let lastTimestamp: number =
        recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

    let isPaused = true;

    const previousPlayerDataEventsByField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>();

    let previousPlayerPositionEvent: PlayerPositionEvent | null = null;
    let previousPositionEventWithChangedPosition: PlayerPositionEvent | null = null;
    let previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;

    for (const recording of recordings.sort((a, b) => a.partNumber! - b.partNumber!)) {
        for (const event of recording.events) {
            // msIntoGame calculation
            if (event instanceof RecordingFileVersionEvent) {
                // time before the previous event and this event is not counted,
                // since either the session just started again, or pause has been active, or a scene has been loaded
                // TODO add remaining event checks
                // console.log('time between sessions not counted', event.timestamp - lastTimestamp);
                lastTimestamp = event.timestamp;
                isPaused = false;
            } else if (event instanceof HeroStateEvent && event.field.name === 'isPaused') {
                isPaused = event.value;
                if (!isPaused) {
                    lastTimestamp = event.timestamp;
                }
            } else {
                if (event instanceof PlayerPositionEvent) {
                    const playerPositionChanged =
                        previousPositionEventWithChangedPosition?.position?.equals(event.position) !== true;
                    if (playerPositionChanged) {
                        previousPositionEventWithChangedPosition = event;
                    }
                    event.previousPlayerPositionEvent = previousPlayerPositionEvent;
                    event.previousPlayerPositionEventWithMapPosition = previousPlayerPositionEventWithMapPosition;
                    if (event.mapPosition != null && previousPlayerPositionEventWithMapPosition?.mapPosition != null) {
                        event.mapDistanceToPrevious = previousPlayerPositionEventWithMapPosition.mapPosition.distanceTo(
                            event.mapPosition,
                        );
                    }
                    if (event.mapPosition != null) {
                        previousPlayerPositionEventWithMapPosition = event;
                    }
                    previousPlayerPositionEvent = event;
                }

                if (!isPaused) {
                    const diff = event.timestamp - lastTimestamp;
                    const msSinceLastPositionChange =
                        event.timestamp - (previousPositionEventWithChangedPosition?.timestamp ?? 0);

                    // starting with 10 seconds of no events, the time is not counted
                    // this might happen, because sb closed their laptop / turned off their pc,
                    // without closing HollowKnight, and when opening the laptop again, the recorder just continues.
                    const skipTimeDeltaBecauseOfNoEvents = diff > 10 * 1000;

                    // even when we have a position change, if it hasn't changed for 30 seconds, one probably has left
                    // hollow knight open accidentally. So time is not counted.
                    // TODO add option to UI to make this filtering optional.
                    const skipTimeDeltaBecauseNoPositionChange = msSinceLastPositionChange > 30 * 1000;

                    if (!skipTimeDeltaBecauseOfNoEvents && !skipTimeDeltaBecauseNoPositionChange) {
                        msIntoGame += event.timestamp - lastTimestamp;
                    }
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
