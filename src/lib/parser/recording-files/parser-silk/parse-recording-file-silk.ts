import { Vector2 } from '~/lib/game-data/shared/vectors';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { entryTypeSilk, EntryTypeSilk } from './entry-type-silk';
import { recordingFileVersionToModVersionSilk } from './mod-version-silk';
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

	const readUint16 = () => {
		ensure(2);
		const v = view.getUint16(offset, true);
		offset += 2;
		return v;
	};

	const readInt64 = () => {
		ensure(8);
		const v = Number(view.getBigInt64(offset, true));
		offset += 8;
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

	const readGuid = () => {
		ensure(16);
		const bytes = new Uint8Array(recordingFileContent, offset, 16);
		offset += 16;

		// convert to hex UUID
		const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	};

	// header
	const recordingFileVersion = readInt32();
	const _localRunId = readGuid();
	const _partNumber = readInt64();

	const hkVizModVersion = recordingFileVersionToModVersionSilk[recordingFileVersion] ?? null;

	try {
		while (offset < view.byteLength) {
			const entryType = readUint8() as EntryTypeSilk;

			switch (entryType) {
				case entryTypeSilk.TimestampFull: {
					ctx.timestamp = readInt64();
					break;
				}

				case entryTypeSilk.TimestampBackwards: {
					const timestamp = readInt64();
					if (timestamp < ctx.timestamp) {
						console.warn('Silk recording timestamp moved backwards', {
							previousTimestamp: ctx.timestamp,
							timestamp,
							deltaMillis: timestamp - ctx.timestamp,
							offset,
						});
					}
					ctx.timestamp = timestamp;
					break;
				}

				case entryTypeSilk.TimestampAddByte: {
					ctx.timestamp += readUint8();
					break;
				}

				case entryTypeSilk.TimestampAddShort: {
					ctx.timestamp += readUint16();
					break;
				}

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

	return new ParsedRecordingSilk(
		events,
		unknownEvents,
		parsingErrors,
		combinedPartNumber,
		recordingFileVersion,
		hkVizModVersion,
	);
}
