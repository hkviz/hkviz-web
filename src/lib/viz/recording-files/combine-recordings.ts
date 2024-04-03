import { raise } from '~/lib/utils/utils';
import { type HeroStateField } from '../hero-state/hero-states';
import { getDefaultValue, playerDataFields, type PlayerDataField } from '../player-data/player-data';
import { isVersionBefore1_4_0, type RecordingFileVersion } from '../types/recording-file-version';
import { FrameEndEvent, frameEndEventHeroStateFields, frameEndEventPlayerDataFields } from './events/frame-end-event';
import { HKVizModVersionEvent } from './events/hkviz-mod-version-event';
import { ModdingInfoEvent } from './events/modding-info-event';
import { PlayerDataEvent } from './events/player-data-event';
import { PlayerPositionEvent } from './events/player-position-event';
import { SceneEvent } from './events/scene-event';
import {
    CombinedRecording,
    HeroStateEvent,
    RecordingFileVersionEvent,
    isPlayerDataEventOfField,
    isPlayerDataEventWithFieldType,
    type ParsedRecording,
    type RecordingEvent,
} from './recording';

function isPantheonRoom(sceneName: string) {
    return sceneName.startsWith('GG_') && !sceneName.startsWith('GG_Atrium');
}

export function combineRecordings(recordings: ParsedRecording[]): CombinedRecording {
    const events: RecordingEvent[] = [];
    let msIntoGame = 0;
    let lastTimestamp: number =
        recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

    let isPaused = true;
    let isTransitioning = false;

    const previousPlayerDataEventsByField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>();
    function getPreviousPlayerData<TField extends PlayerDataField>(field: TField) {
        return previousPlayerDataEventsByField.get(field) as PlayerDataEvent<TField> | undefined;
    }

    const previousHeroStateByField = new Map<HeroStateField, HeroStateEvent>();
    function getPreviousHeroState(field: HeroStateField) {
        return previousHeroStateByField.get(field);
    }

    let createEndFrameEvent = false;

    let previousPlayerPositionEvent: PlayerPositionEvent | null = null;
    let previousPositionEventWithChangedPosition: PlayerPositionEvent | null = null;
    let previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
    let previousFrameEndEvent: FrameEndEvent | null = null;
    let previousSceneEvent: SceneEvent | null = null;

    let recordingFileVersion: RecordingFileVersion = '0.0.0';

    const visitedScenesToCheckIfInPlayerData = [] as { sceneName: string; msIntoGame: number }[];

    const allModVersions = new Map<string, Set<string>>();
    const allHkVizModVersions = new Set<string>();

    const hasCreatedFirstEndFrameEvent = false;

    for (const recording of recordings.sort((a, b) => a.combinedPartNumber! - b.combinedPartNumber!)) {
        for (const event of recording.events) {
            // create together player data event if needed
            // TODO might be good to exclude some fields here since they are updated very often and not needed
            // for the visualizations
            if (event.timestamp > lastTimestamp) {
                if (!hasCreatedFirstEndFrameEvent && recording.combinedPartNumber === 1) {
                    Object.values(playerDataFields.byFieldName).forEach((field) => {
                        if (!previousPlayerDataEventsByField.has(field)) {
                            // if part number = 1 all non default player data fields should have been added
                            // so we can add default values for the rest
                            const event = new PlayerDataEvent<PlayerDataField>({
                                field,
                                timestamp: 0,
                                value: getDefaultValue(field),
                            } as any);
                            events.push(event);
                            previousPlayerDataEventsByField.set(field, event);
                            if (frameEndEventPlayerDataFields.has(field)) {
                                createEndFrameEvent = true;
                            }
                        }
                    });
                }
                if (createEndFrameEvent) {
                    const endFrameEvent: FrameEndEvent = new FrameEndEvent({
                        timestamp: lastTimestamp,
                        getPreviousPlayerData,
                        msIntoGame,
                        previousFrameEndEvent,
                        previousPlayerPositionEvent,
                        getPreviousHeroState,
                    });
                    previousFrameEndEvent = endFrameEvent;
                    events.push(endFrameEvent);
                    createEndFrameEvent = false;
                }
            }

            // msIntoGame calculation
            if (event instanceof RecordingFileVersionEvent) {
                // time before the previous event and this event is not counted,
                // since either the session just started again, or pause has been active, or a scene has been loaded
                // TODO add remaining event checks
                // console.log('time between sessions not counted', event.timestamp - lastTimestamp);
                lastTimestamp = event.timestamp;
                isPaused = false;
                recordingFileVersion = event.version;
            } else if (event instanceof ModdingInfoEvent) {
                for (const mod of event.mods) {
                    const versions = allModVersions.get(mod.name) ?? new Set();
                    mod.versions.forEach((v) => versions.add(v));
                    allModVersions.set(mod.name, versions);
                }
            } else if (event instanceof HKVizModVersionEvent) {
                allHkVizModVersions.add(event.version);
            } else if (event instanceof SceneEvent) {
                event.previousSceneEvent = previousSceneEvent;
                const previousCurrentBossSequenceEvent = getPreviousPlayerData(
                    playerDataFields.byFieldName.currentBossSequence,
                );
                if (previousCurrentBossSequenceEvent?.value && !isPantheonRoom(event.sceneName)) {
                    // pantheon stopped, but game does not change player data to reflect that
                    // so a event is faked here

                    const currentBossSequenceEvent = new PlayerDataEvent<
                        typeof playerDataFields.byFieldName.currentBossSequence
                    >({
                        timestamp: lastTimestamp,
                        value: null,
                        field: playerDataFields.byFieldName.currentBossSequence,
                        previousPlayerPositionEvent: previousPlayerPositionEvent,
                        previousPlayerDataEventOfField: previousCurrentBossSequenceEvent ?? null,
                    });
                    currentBossSequenceEvent.msIntoGame = msIntoGame;
                    previousPlayerDataEventsByField.set(
                        playerDataFields.byFieldName.currentBossSequence,
                        currentBossSequenceEvent,
                    );
                    events.push(currentBossSequenceEvent);
                }

                const currentBossSequence =
                    getPreviousPlayerData(playerDataFields.byFieldName.currentBossSequence)?.value ?? null;
                event.currentBossSequence = currentBossSequence;

                const visitedScenes = getPreviousPlayerData(playerDataFields.byFieldName.scenesVisited)?.value ?? [];

                // if scene is not in player data, it might still be added in a few seconds or so, but if its not
                // its added to the scenes below.
                if (!visitedScenes.includes(event.sceneName)) {
                    visitedScenesToCheckIfInPlayerData.push({ sceneName: event.sceneName, msIntoGame });
                }

                // in version < 1.4.0 the mod did not record the transitioning bool
                // therefore, here we try to detect player events which where transitioned to a new scene
                // and remove them:
                if (isVersionBefore1_4_0(recordingFileVersion) && previousPlayerPositionEvent) {
                    const lastPlayerPositionEvent: PlayerPositionEvent = previousPlayerPositionEvent;
                    const sceneEvent = lastPlayerPositionEvent.sceneEvent;
                    const sceneOriginOffset = sceneEvent.originOffset;
                    const sceneSize = sceneEvent.sceneSize;

                    let currentPlayerPositionEvent: PlayerPositionEvent | null = lastPlayerPositionEvent;
                    while (
                        sceneOriginOffset &&
                        sceneSize &&
                        currentPlayerPositionEvent &&
                        // max 6 seconds of removed events allowed
                        Math.abs(lastPlayerPositionEvent.timestamp - currentPlayerPositionEvent.timestamp) < 20_000 &&
                        currentPlayerPositionEvent.previousPlayerPositionEvent &&
                        currentPlayerPositionEvent.sceneEvent ===
                            currentPlayerPositionEvent.previousPlayerPositionEvent.sceneEvent &&
                        // when transitioning upwards, y does not change
                        (currentPlayerPositionEvent.position.x < sceneOriginOffset.x - 2 ||
                            currentPlayerPositionEvent.position.x > sceneOriginOffset.x + sceneSize.x + 2 ||
                            currentPlayerPositionEvent.position.y < sceneOriginOffset.y - 2 ||
                            currentPlayerPositionEvent.position.y > sceneOriginOffset.y + sceneSize.y + 2)
                    ) {
                        events.splice(events.indexOf(currentPlayerPositionEvent), 1);
                        currentPlayerPositionEvent = currentPlayerPositionEvent.previousPlayerPositionEvent;
                    }
                    // found first event with this x position (hopefully last position before transition)
                    // now all other events which have a player position reference should instead
                    // reference the new last one
                    previousPlayerPositionEvent = currentPlayerPositionEvent;
                    previousPlayerPositionEventWithMapPosition = currentPlayerPositionEvent?.mapPosition
                        ? currentPlayerPositionEvent
                        : currentPlayerPositionEvent?.previousPlayerPositionEventWithMapPosition ?? null;

                    if (currentPlayerPositionEvent) {
                        const startIndex = events.indexOf(currentPlayerPositionEvent) + 1;
                        for (let i = startIndex; i < events.length; i++) {
                            const event = events[i];
                            if (event && 'previousPlayerPositionEvent' in event) {
                                event.previousPlayerPositionEvent = currentPlayerPositionEvent;
                            }
                            if (event && 'previousPlayerPositionEventWithMapPosition' in event) {
                                event.previousPlayerPositionEventWithMapPosition =
                                    previousPlayerPositionEventWithMapPosition;
                            }
                            if (event && 'mapDistanceToPrevious' in event) {
                                // event.mapDistanceToPrevious = null;
                            }
                        }
                    }
                }
                previousSceneEvent = event;
            } else if (event instanceof HeroStateEvent) {
                if (event.field.name === 'isPaused') {
                    isPaused = event.value;
                    if (!isPaused) {
                        lastTimestamp = event.timestamp;
                    }
                } else if (event.field.name === 'transitioning') {
                    isTransitioning = event.value;
                    lastTimestamp = event.timestamp;
                }
                previousHeroStateByField.set(event.field, event);
                if (frameEndEventHeroStateFields.has(event.field)) {
                    createEndFrameEvent = true;
                }
            } else {
                if (event instanceof PlayerPositionEvent) {
                    if (isTransitioning) {
                        continue;
                    }
                    event.calcMapPosition();
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
                    // without closing Hollow Knight, and when opening the laptop again, the recorder just continues.
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

                if (isPlayerDataEventOfField(event, playerDataFields.byFieldName.currentBossSequence)) {
                    const sceneEvent = previousPlayerPositionEvent?.sceneEvent;
                    if (sceneEvent && isPantheonRoom(sceneEvent.sceneName)) {
                        sceneEvent.currentBossSequence = event.value;
                    }
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
                                // console.log('scene not in visitedScenes anymore, added it again', {
                                //     sceneName: it,
                                //     msIntoGame,
                                // });
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
    if (previousFrameEndEvent) {
        events.push(
            new FrameEndEvent({
                timestamp: lastTimestamp,
                getPreviousPlayerData,
                msIntoGame,
                previousFrameEndEvent,
                previousPlayerPositionEvent,
                getPreviousHeroState,
            }),
        );
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

    (window as any).hkvizEvents = () => events;

    return new CombinedRecording(
        events,
        recordings.reduce((sum, recording) => sum + recording.unknownEvents, 0),
        recordings.reduce((sum, recording) => sum + recording.parsingErrors, 0),
        previousPlayerDataEventsByField,
        [...allModVersions.entries()].map(([name, versions]) => ({ name, versions: [...versions.values()].sort() })),
        [...allHkVizModVersions].sort(),
    );
}
