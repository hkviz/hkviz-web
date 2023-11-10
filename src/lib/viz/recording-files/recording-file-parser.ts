import { Vector2 } from '../types/vector2';
import { EVENT_TYPE_PREFIXES, type EventTypePrefix } from './event-type-prefixes';
import { PlayerPositionEvent, Recording, type RecordingEvent, SceneEvent } from './recording';

function parseFloatAnyComma(value: string) {
    return parseFloat(value.replace(',', '.'));
}

function parseVector2(x: string, y: string) {
    return new Vector2(parseFloatAnyComma(x), parseFloatAnyComma(y));
}

export function parseRecordingFile(recordingFileContent: string): Recording {
    const lines = recordingFileContent.split('\n');
    const events: RecordingEvent[] = [];

    let lastSceneEvent: SceneEvent | undefined = undefined;

    for (const line of lines) {
        try {
            console.log(line);
            const [eventType, timestamp, ...args] = line.replace(/\r/gi, '').split(';');

            switch (eventType as EventTypePrefix) {
                case EVENT_TYPE_PREFIXES.SCENE_CHANGE: {
                    lastSceneEvent = new SceneEvent({
                        timestamp: parseInt(timestamp!),
                        sceneName: args[0]!,
                        originOffset: undefined,
                        sceneSize: undefined,
                    });
                    events.push(lastSceneEvent);
                    break;
                }
                case EVENT_TYPE_PREFIXES.ROOM_DIMENSIONS: {
                    if (lastSceneEvent) {
                        lastSceneEvent.originOffset = parseVector2(args[0]!, args[1]!);
                        lastSceneEvent.sceneSize = parseVector2(args[2]!, args[3]!);
                    }
                    break;
                }
                case EVENT_TYPE_PREFIXES.PLAYER_POSITION: {
                    if (lastSceneEvent) {
                        events.push(
                            new PlayerPositionEvent({
                                timestamp: parseInt(timestamp!),
                                position: parseVector2(args[0]!, args[1]!),
                                sceneEvent: lastSceneEvent,
                            }),
                        );
                    }
                    break;
                }
                default: {
                    console.log('Unexpected event type: ', eventType, ' line ignored.', line);
                    // TODO record errors, as we should show them to the user
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    return new Recording(events);
}
