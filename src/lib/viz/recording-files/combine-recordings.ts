import { raise } from '~/lib/utils/utils';
import { playerDataFields, type PlayerDataField } from '../player-data/player-data';
import {
    CombinedRecording,
    FrameEndEvent,
    HeroStateEvent,
    PlayerDataEvent,
    PlayerPositionEvent,
    RecordingFileVersionEvent,
    SceneEvent,
    frameEndEventPlayerDataFields,
    isPlayerDataEventOfField,
    isPlayerDataEventWithFieldType,
    type ParsedRecording,
    type RecordingEvent,
} from './recording';

export function combineRecordings(recordings: ParsedRecording[]): CombinedRecording {
    const events: RecordingEvent[] = [];
    let msIntoGame = 0;
    let lastTimestamp: number =
        recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

    let isPaused = true;

    const previousPlayerDataEventsByField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>();
    function getPreviousPlayerData<TField extends PlayerDataField>(field: TField) {
        return previousPlayerDataEventsByField.get(field) as PlayerDataEvent<TField> | undefined;
    }
    let createEndFrameEvent = false;

    let previousPlayerPositionEvent: PlayerPositionEvent | null = null;
    let previousPositionEventWithChangedPosition: PlayerPositionEvent | null = null;
    let previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
    let previousEndFrameEvent: FrameEndEvent | null = null;

    const visitedScenesToCheckIfInPlayerData = [] as { sceneName: string; msIntoGame: number }[];

    for (const recording of recordings.sort((a, b) => a.partNumber! - b.partNumber!)) {
        for (const event of recording.events) {
            // create together player data event if needed
            // TODO might be good to exclude some fields here since they are updated very often and not needed
            // for the visualizations
            if (createEndFrameEvent && event.timestamp > lastTimestamp) {
                const endFrameEvent = new FrameEndEvent({
                    timestamp: lastTimestamp,
                    getPreviousPlayerData,
                    msIntoGame,
                });
                previousEndFrameEvent = endFrameEvent;
                events.push(endFrameEvent);
                createEndFrameEvent = false;
            }

            // msIntoGame calculation
            if (event instanceof RecordingFileVersionEvent) {
                // time before the previous event and this event is not counted,
                // since either the session just started again, or pause has been active, or a scene has been loaded
                // TODO add remaining event checks
                // console.log('time between sessions not counted', event.timestamp - lastTimestamp);
                lastTimestamp = event.timestamp;
                isPaused = false;
            } else if (event instanceof SceneEvent) {
                const visitedScenes = getPreviousPlayerData(playerDataFields.byFieldName.scenesVisited)?.value ?? [];

                // if scene is not in player data, it might still be added in a few seconds or so, but if its not
                // its added to the scenes below.
                if (!visitedScenes.includes(event.sceneName)) {
                    visitedScenesToCheckIfInPlayerData.push({ sceneName: event.sceneName, msIntoGame });
                }
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
                if (frameEndEventPlayerDataFields.has(event.field)) {
                    createEndFrameEvent = true;
                }

                if (isPlayerDataEventWithFieldType(event, 'List`1')) {
                    event.value = event.value.flatMap((it) =>
                        it === '::' ? event.previousPlayerDataEventOfField?.value ?? [] : [it],
                    );
                    if (isPlayerDataEventOfField(event, playerDataFields.byFieldName.scenesVisited)) {
                        for (const it of event.previousPlayerDataEventOfField?.value ?? []) {
                            // even if scenes are removed again from the player data (e.g. by loading an old save or modding),
                            // we don't want to loose the scenes visited in the recording.
                            if (!event.value.includes(it)) {
                                event.value.push(it);
                                console.log('scene not in visitedScenes anymore, added it again', {
                                    sceneName: it,
                                    msIntoGame,
                                });
                            }
                        }
                    }
                }
            }

            events.push(event);
            addScenesWhichWhereNotAdded();
        }
    }
    addScenesWhichWhereNotAdded(true);
    // there might not have been a end frame event for a bit at the end, so we duplicate the last one
    // so graphs can depend on there being one at the end of the msIntoGame
    if (previousEndFrameEvent) {
        events.push(new FrameEndEvent({ timestamp: lastTimestamp, getPreviousPlayerData, msIntoGame }));
    }

    function addScenesWhichWhereNotAdded(all = false) {
        while (
            visitedScenesToCheckIfInPlayerData.length > 0 &&
            (all || visitedScenesToCheckIfInPlayerData[0]!.msIntoGame + 2000 < msIntoGame)
        ) {
            const { sceneName, msIntoGame } = visitedScenesToCheckIfInPlayerData.shift()!;
            const previousScenesVisitedEvent = getPreviousPlayerData(playerDataFields.byFieldName.scenesVisited);
            const previousValue = previousScenesVisitedEvent?.value ?? [];

            if (!previousValue.includes(sceneName)) {
                const visitedScenesEvent = new PlayerDataEvent<typeof playerDataFields.byFieldName.scenesVisited>({
                    timestamp: lastTimestamp,
                    value: [...previousValue, sceneName],
                    field: playerDataFields.byFieldName.scenesVisited,

                    previousPlayerPositionEvent: previousPlayerPositionEvent,
                    previousPlayerDataEventOfField: previousScenesVisitedEvent ?? null,
                });
                visitedScenesEvent.msIntoGame = msIntoGame;
                previousPlayerDataEventsByField.set(playerDataFields.byFieldName.scenesVisited, visitedScenesEvent);
                if (frameEndEventPlayerDataFields.has(playerDataFields.byFieldName.scenesVisited)) {
                    createEndFrameEvent = true;
                }
                events.push(visitedScenesEvent);
            }
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
