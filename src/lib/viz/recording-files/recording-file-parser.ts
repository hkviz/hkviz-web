import { typeCheckNever } from '~/lib/utils';
import { Vector2 } from '../types/vector2';
import {
    EVENT_PREFIXES,
    PARTIAL_EVENT_PREFIXES,
    type EventPrefix,
    type PartialEventPrefix,
} from './event-type-prefixes';
import {
    ParsedRecording,
    PlayerPositionEvent,
    RecordingFileVersionEvent,
    SceneEvent,
    type RecordingEvent,
} from './recording';

function parseFloatAnyComma(value: string) {
    return parseFloat(value.replace(',', '.'));
}

function parseVector2(x: string, y: string) {
    return new Vector2(parseFloatAnyComma(x), parseFloatAnyComma(y));
}

export function parseRecordingFile(recordingFileContent: string, partNumber: number): ParsedRecording {
    const lines = recordingFileContent.split('\n');
    const events: RecordingEvent[] = [];
    let unknownEvents = 0;
    let parsingErrors = 0;

    let lastSceneEvent: SceneEvent | undefined = undefined;
    let previousPlayerPosition: Vector2 | undefined = undefined;
    let previousTimestamp: number | undefined = undefined;

    LINE_LOOP: for (const line of lines) {
        try {
            // empty lines are skipped
            if (!line) continue;

            const [prefix, ...args] = line.replace(/\r/gi, '').split(';');
            if (prefix == null) throw new Error('No prefix found');
            const [eventType, timestampStr] = prefix?.split(/[=\+]/);
            if (eventType == null) throw new Error('No event type found');
            // console.log(prefix, eventType, timestampStr);
            // continue;

            // ------ TIMESTAMPS ------
            const isRelativeTimestamp = prefix.includes('+');

            let timestamp: number;
            if (timestampStr == null || timestampStr === '') {
                if (previousTimestamp === undefined) {
                    throw new Error('Relative timestamp found, but no previous timestamp found');
                }
                timestamp = previousTimestamp!;
            } else if (isRelativeTimestamp) {
                if (previousTimestamp == null) {
                    throw new Error('Relative timestamp found, but no previous timestamp found');
                }
                timestamp = previousTimestamp + parseInt(timestampStr);
            } else {
                timestamp = parseInt(timestampStr);
            }
            previousTimestamp = timestamp;

            // ------ EVENT TYPE ------
            let didParse = true;
            const partialEventType = eventType[0] as PartialEventPrefix;
            switch (partialEventType) {
                case PARTIAL_EVENT_PREFIXES.PLAYER_DATA_SHORTNAME: {
                    // TODO
                    continue LINE_LOOP;
                }
                case PARTIAL_EVENT_PREFIXES.PLAYER_DATA_LONGNAME: {
                    // TODO
                    continue LINE_LOOP;
                }
                case PARTIAL_EVENT_PREFIXES.HERO_CONTROLER_STATE_SHORTNAME: {
                    // TODO
                    continue LINE_LOOP;
                }
                case PARTIAL_EVENT_PREFIXES.HERO_CONTROLER_STATE_LONGNAME: {
                    // TODO
                    continue LINE_LOOP;
                }
                default: {
                    typeCheckNever(partialEventType);
                    didParse = false;
                }
            }

            const eventTypePrefix = eventType as EventPrefix;
            switch (eventTypePrefix) {
                case EVENT_PREFIXES.SCENE_CHANGE: {
                    lastSceneEvent = new SceneEvent({
                        timestamp,
                        sceneName: args[0]!,
                        originOffset: undefined,
                        sceneSize: undefined,
                    });
                    events.push(lastSceneEvent);
                    break;
                }
                case EVENT_PREFIXES.ROOM_DIMENSIONS: {
                    if (lastSceneEvent) {
                        lastSceneEvent.originOffset = parseVector2(args[0]!, args[1]!);
                        lastSceneEvent.sceneSize = parseVector2(args[2]!, args[3]!);
                    }
                    break;
                }
                case EVENT_PREFIXES.PLAYER_POSITION: {
                    if (lastSceneEvent) {
                        const position: Vector2 | undefined =
                            args[0] === '=' ? previousPlayerPosition : parseVector2(args[0]!, args[1]!);
                        if (!position) {
                            throw new Error('Could not assign player position to player position event');
                        }
                        previousPlayerPosition = position;
                        events.push(
                            new PlayerPositionEvent({
                                timestamp,
                                position,
                                sceneEvent: lastSceneEvent,
                            }),
                        );
                    }
                    break;
                }
                case EVENT_PREFIXES.HZVIZ_MOD_VERSION: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.HOLLOWKNIGHT_VERSION: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.RECORDING_FILE_VERSION: {
                    events.push(
                        new RecordingFileVersionEvent({
                            timestamp,
                            version: args[0]!,
                        }),
                    );
                    break;
                }
                case EVENT_PREFIXES.RECORDING_ID: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.SESSION_END: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.SPELL_FIREBALL: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.SPELL_UP: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.SPELL_DOWN: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.NAIL_ART_CYCLONE: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.NAIL_ART_D_SLASH: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.NAIL_ART_G_SLASH: {
                    // TODO
                    break;
                }
                case EVENT_PREFIXES.SUPER_DASH: {
                    // TODO
                    break;
                }
                default: {
                    if (!didParse) {
                        typeCheckNever(eventTypePrefix);
                        console.log(`Unexpected event type |${eventType}| ignoring line |${line}|`);
                        unknownEvents++;
                    }
                }
            }
        } catch (e) {
            console.error(`Error while parsing line: |${line}|`, e);
            parsingErrors++;
        }
    }

    return new ParsedRecording(events, unknownEvents, parsingErrors, partNumber);
}
