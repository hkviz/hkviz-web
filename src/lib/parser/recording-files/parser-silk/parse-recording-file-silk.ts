import { Vector2 } from '~/lib/game-data/shared/vectors';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { entryTypeSilk, EntryTypeSilk } from './entry-type-silk';
import { ParsedRecordingSilk, RecordingEventSilk } from './recording-silk';
import { sceneIdToSceneName } from './scene-ids';
import { isSubSceneName as isSubSceneNameSilk } from './sub-scene-names';

export function parseRecordingFileSilk(
	recordingFileContent: ArrayBuffer,
	combinedPartNumber: number,
): ParsedRecordingSilk {
	const events: RecordingEventSilk[] = [];
	let unknownEvents = 0;
	let parsingErrors = 0;

	let previousSceneEvent: SceneEvent | null = null;

	const ctx: EventCreationContext = new EventCreationContext();

	const view = new DataView(recordingFileContent);
	let offset = 0;

	const ensure = (bytes: number) => {
		if (offset + bytes > view.byteLength) {
			throw new Error(`EOF: need ${bytes} bytes at ${offset}`);
		}
	};

	const readUint8 = () => {
		ensure(1);
		return view.getUint8(offset++);
	};

	const readInt16 = () => {
		ensure(2);
		const v = view.getInt16(offset, true);
		offset += 2;
		return v;
	};

	const readInt32 = () => {
		ensure(4);
		const v = view.getInt32(offset, true);
		offset += 4;
		return v;
	};

	const readFloat32 = () => {
		ensure(4);
		const v = view.getFloat32(offset, true);
		offset += 4;
		return v;
	};

	const readString = () => {
		const length = readInt32();
		ensure(length);
		const bytes = new Uint8Array(recordingFileContent, offset, length);
		offset += length;
		return new TextDecoder().decode(bytes);
	};

	const readVector2 = () => {
		const x = readFloat32();
		const y = readFloat32();
		return new Vector2(x, y);
	};

	try {
		while (offset < view.byteLength) {
			const entryType = readUint8() as EntryTypeSilk;

			switch (entryType) {
				case entryTypeSilk.SceneChangeSingleShort:
				case entryTypeSilk.SceneChangeAddShort: {
					const sceneId = readInt16();
					const sceneName = sceneIdToSceneName.get(sceneId) ?? `unknown_scene_${sceneId}`;

					if (!isSubSceneNameSilk(sceneName)) {
						// for now - added scenes are ignored
						const sceneEvent = new SceneEvent(sceneName, undefined, undefined, ctx);
						events.push(sceneEvent);
						previousSceneEvent = sceneEvent;
					}
					break;
				}

				case entryTypeSilk.SceneChangeSingleLong:
				case entryTypeSilk.SceneChangeAddLong: {
					const sceneName = readString();
					if (!isSubSceneNameSilk(sceneName)) {
						// for now - added scenes are ignored
						const sceneEvent = new SceneEvent(sceneName, undefined, undefined, ctx);
						events.push(sceneEvent);
						previousSceneEvent = sceneEvent;
					}
					break;
				}

				case entryTypeSilk.HeroLocation: {
					const position = readVector2();

					if (previousSceneEvent) {
						const posEvent = new PlayerPositionEvent(position, previousSceneEvent, ctx);
						events.push(posEvent);
					}
					break;
				}

				case entryTypeSilk.SceneBoundary: {
					const size = readVector2();
					if (previousSceneEvent) {
						previousSceneEvent.originOffset = Vector2.ZERO;
						previousSceneEvent.sceneSize = size;
					}
					break;
				}

				default: {
					unknownEvents++;
					console.warn('Unknown entryType', entryType, 'at offset', offset);

					// stop parsing to avoid desync
					offset = view.byteLength;
					break;
				}
			}
		}
	} catch (e) {
		console.error('Parsing error at offset', offset, e);
		parsingErrors++;
	}

	return new ParsedRecordingSilk(events, unknownEvents, parsingErrors, combinedPartNumber);
}
