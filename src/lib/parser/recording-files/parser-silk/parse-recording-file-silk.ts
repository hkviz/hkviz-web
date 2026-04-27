import { Vector2 } from '~/lib/game-data/shared/vectors';
import { playerDataFieldsSilk } from '~/lib/game-data/silk-data/player-data-silk';
import {
	PlayerDataFieldNameSilk,
	PlayerDataFieldSilk,
	PlayerDataFieldValueSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { StoryEventInfoSilk } from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';
import { typeCheckNever } from '~/lib/util';
import { isSubSceneNameSilk } from '../../../game-data/silk-data/sub-scene-names-silk';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { PlayerDataEventSilk } from '../events-silk/player-data-event-silk';
import { SceneDataEventSilk } from '../events-silk/scene-data-event-silk';
import {
	parseIndexedListDelta,
	parseStoryEventListDelta,
	parseWrappedVector2ListDelta,
} from './collection-parsing/list-delta-parsing-silk';
import { parseNamedMapDelta, parseNamedMapFull } from './collection-parsing/named-map-parsing-silk';
import { parseStringSetDelta } from './collection-parsing/set-delta-parsing-silk';
import { entryTypeNameSilk, entryTypeSilk, EntryTypeSilk } from './entry-type-silk';
import { recordingFileVersionToModVersionSilk } from './mod-version-silk';
import { ParsedRecordingSilk, RecordingEventSilk } from './recording-silk';
import { SilkRecordingDataView } from './silk-recording-data-view';
import { StorageStats } from './storage-stats';
import { getStringIdToStringForField, stringIdMappingSilk } from './string-id-by-field-silk';

export function parseRecordingFileSilk(
	recordingFileContent: ArrayBuffer,
	combinedPartNumber: number,
): ParsedRecordingSilk {
	const events: RecordingEventSilk[] = [];
	let unknownEvents = 0;
	let parsingErrors = 0;

	let previousSceneEvent: SceneEvent | null = null;
	let previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	const previousPlayerDataEventByField = new Map<
		PlayerDataFieldNameSilk,
		PlayerDataEventSilk<PlayerDataFieldNameSilk>
	>();

	const ctx: EventCreationContext = new EventCreationContext();

	const reader = new SilkRecordingDataView(recordingFileContent);

	// header
	const recordingFileVersion = reader.readInt32();
	const _localRunId = reader.readGuid();
	const _partNumber = reader.readInt64();

	const hkVizModVersion = recordingFileVersionToModVersionSilk[recordingFileVersion] ?? null;

	const logParserStep = (step: string, details?: unknown): void => {
		// console.log(`[silk-parser] ${step}`, details);
	};

	const pushEvent = (event: RecordingEventSilk, details?: Record<string, unknown>): void => {
		events.push(event);
		logParserStep('event_parsed', {
			eventType: event.constructor.name,
			timestamp: event.timestamp,
			msIntoGame: event.msIntoGame,
			...details,
		});
	};

	logParserStep('header', {
		recordingFileVersion,
		hkVizModVersion,
		combinedPartNumber,
		byteLength: reader.byteLength,
	});

	const resolvePlayerDataField = (fieldId: number): PlayerDataFieldSilk | null => {
		const field = playerDataFieldsSilk.byId.get(fieldId);
		if (!field) {
			unknownEvents++;
			console.warn('Unknown player data field id', fieldId, 'at offset', reader.offset);
			return null;
		}
		return field;
	};

	const throwIfFieldTypeMismatch = (
		entryType: EntryTypeSilk,
		field: PlayerDataFieldSilk,
		fieldId: number,
		allowedTypes: readonly string[],
	): void => {
		if (!allowedTypes.includes(field.type)) {
			throw new Error(
				`Invalid player data entry type ${entryType} for fieldId ${fieldId} (${field.name}) with type ${field.type}. Allowed: ${allowedTypes.join(', ')}`,
			);
		}
	};

	const pushPlayerDataEvent = (field: PlayerDataFieldNameSilk, value: unknown): void => {
		const previousPlayerDataEventOfField = previousPlayerDataEventByField.get(field) ?? null;
		const event = new PlayerDataEventSilk(
			previousPlayerPositionEvent,
			previousPlayerDataEventOfField as any,
			field as any,
			value as PlayerDataFieldValueSilk<any>,
			ctx,
		);
		previousPlayerDataEventByField.set(field, event as PlayerDataEventSilk<PlayerDataFieldNameSilk>);
		pushEvent(event, {
			field,
		});
		logParserStep('player_data_event', {
			field,
			value,
			previousValueExists: previousPlayerDataEventOfField != null,
		});
	};

	const storageStats = new StorageStats();

	try {
		while (reader.offset < reader.byteLength) {
			const entryOffset = reader.offset;
			const entryType = reader.readUint8() as EntryTypeSilk;
			const entryTypeName = entryTypeNameSilk(entryType);
			logParserStep('entry_start', {
				offset: entryOffset,
				entryType,
				entryTypeName,
			});
			let trackedField = null;
			reader.logState = entryTypeName;

			switch (entryType) {
				case entryTypeSilk.SessionStart: {
					logParserStep('session_start');
					break;
				}
				case entryTypeSilk.SessionEnd: {
					logParserStep('session_end');
					break;
				}
				case entryTypeSilk.TimestampFull: {
					ctx.timestamp = reader.readInt64();
					logParserStep('timestamp_full', { timestamp: ctx.timestamp });
					break;
				}

				case entryTypeSilk.TimestampBackwards: {
					const timestamp = reader.readInt64();
					if (timestamp < ctx.timestamp) {
						console.warn('Silk recording timestamp moved backwards', {
							previousTimestamp: ctx.timestamp,
							timestamp,
							deltaMillis: timestamp - ctx.timestamp,
							offset: reader.offset,
						});
					}
					ctx.timestamp = timestamp;
					logParserStep('timestamp_backwards', { timestamp: ctx.timestamp });
					break;
				}

				case entryTypeSilk.TimestampAddByte: {
					ctx.timestamp += reader.readUint8();
					logParserStep('timestamp_add_byte', { timestamp: ctx.timestamp });
					break;
				}

				case entryTypeSilk.TimestampAddShort: {
					ctx.timestamp += reader.readUint16();
					logParserStep('timestamp_add_short', { timestamp: ctx.timestamp });
					break;
				}

				case entryTypeSilk.SceneChangeSingle:
				case entryTypeSilk.SceneChangeAdd: {
					const sceneName = reader.readStringWithId(stringIdMappingSilk.sceneName) ?? '';

					if (!isSubSceneNameSilk(sceneName)) {
						// for now - added scenes are ignored
						const sceneEvent = new SceneEvent(sceneName, undefined, undefined, ctx);
						pushEvent(sceneEvent, { sceneName });
						previousSceneEvent = sceneEvent;
						logParserStep('scene_change', { sceneName, isSubScene: false });
					} else {
						logParserStep('scene_change', { sceneName, isSubScene: true });
					}
					break;
				}

				case entryTypeSilk.HeroLocation: {
					const position = reader.readVector2();

					if (previousSceneEvent) {
						const posEvent = new PlayerPositionEvent(position, previousSceneEvent, ctx);
						pushEvent(posEvent, { position, sceneName: previousSceneEvent.sceneName });
						previousPlayerPositionEvent = posEvent;
						logParserStep('hero_location', { position, scene: previousSceneEvent.sceneName });
					} else {
						logParserStep('hero_location_without_scene', { position });
					}
					break;
				}

				case entryTypeSilk.SceneBoundary: {
					const size = reader.readVector2();
					if (previousSceneEvent) {
						previousSceneEvent.originOffset = Vector2.ZERO;
						previousSceneEvent.sceneSize = size;
						logParserStep('scene_boundary', { scene: previousSceneEvent.sceneName, size });
					} else {
						logParserStep('scene_boundary_without_scene', { size });
					}
					break;
				}

				case entryTypeSilk.PlayerDataBool: {
					const packed = reader.readUint16();
					const fieldId = packed >> 1;
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['bool']);
					const value = (packed & 1) === 1;
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataFloat: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['float']);
					const value = reader.readFloat32();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataInt: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['int']);
					const value = reader.readInt32();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataEnum: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['enum']);
					const value = reader.readUint16();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataULong: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['ulong']);
					const value = reader.readUint64();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataVector3: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['vector3']);
					const value = reader.readVector3();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataVector2: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['vector2']);
					const value = reader.readVector2();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataString: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['string']);
					const value = reader.readStringWithId(getStringIdToStringForField(field));
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataGuid: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['guid']);
					const value = reader.readGuid();
					pushPlayerDataEvent(field.name, value);
					break;
				}

				case entryTypeSilk.PlayerDataIntListFull: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['int[]', 'list<int>']);
					const count = reader.readInt32();
					const values: number[] = [];
					for (let i = 0; i < count; i++) {
						values.push(reader.readInt32());
					}
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataIntListDelta: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['int[]', 'list<int>']);
					logParserStep('int_list_delta_start', {
						fieldId,
						field: field.name,
					});
					const values = parseIndexedListDelta(reader, () => reader.readInt32(), logParserStep);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataStringListFull: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['list<string>']);
					const idToValue = getStringIdToStringForField(field);
					const values = reader.readStringArrayWithIds(idToValue);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataStringListDelta: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['list<string>']);
					const idToValue = getStringIdToStringForField(field);
					logParserStep('string_list_delta_start', {
						fieldId,
						field: field.name,
					});
					const values = parseIndexedListDelta(
						reader,
						() => reader.readStringWithId(idToValue),
						logParserStep,
					);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataStringSetFull: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['hashset<string>']);
					const count = reader.readInt32();
					const values = new Set<string>();
					const idToValue = getStringIdToStringForField(field);
					for (let i = 0; i < count; i++) {
						values.add(reader.readStringWithId(idToValue) ?? '');
					}
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataStringSetDelta: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['hashset<string>']);
					const idToValue = getStringIdToStringForField(field);
					logParserStep('string_set_delta_start', {
						fieldId,
						field: field.name,
					});
					const values = parseStringSetDelta(reader, idToValue, logParserStep);
					console.log('Parsed string set delta for field', field.name, 'with values', values);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataNamedMapFull: {
					const fieldId = reader.readUint16();
					const field = playerDataFieldsSilk.byId.get(fieldId);
					trackedField = field?.name;
					reader.logState = trackedField;
					if (!field) {
						unknownEvents++;
						console.warn('Unknown player data field id', fieldId, 'at offset', reader.offset);
						break;
					}
					// type already checked in named map delta
					// console.log(
					// 	'Parsing named map full for field',
					// 	field.name,
					// 	'type',
					// 	field.type,
					// 	'at offset',
					// 	reader.offset,
					// );

					const values = parseNamedMapFull(reader, field, field.type, logParserStep);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataNamedMapDelta: {
					const fieldId = reader.readUint16();
					const field = playerDataFieldsSilk.byId.get(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						unknownEvents++;
						console.warn('Unknown player data field id', fieldId, 'at offset', reader.offset);
						break;
					}
					// already checked in parseNamedMapDelta
					// console.log(
					// 	'Parsing named map delta for field',
					// 	field.name,
					// 	'of type',
					// 	field.type,
					// 	'at offset',
					// 	reader.offset,
					// );
					logParserStep('named_map_delta_start', {
						fieldId,
						field: field.name,
						fieldName: field.name,
						fieldType: field.type,
					});

					const values = parseNamedMapDelta(reader, field, field.type, logParserStep);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataStoryEventListFull: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['list<playerstory.eventinfo>']);
					const count = reader.readInt32();
					if (count < 0) {
						throw new Error(`Invalid story event list count ${count} at ${reader.offset - 4}`);
					}

					const values: StoryEventInfoSilk[] = [];
					for (let i = 0; i < count; i++) {
						values.push(reader.readStoryEventInfo());
					}

					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataStoryEventListDelta: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['list<playerstory.eventinfo>']);
					logParserStep('story_event_list_delta_start', {
						fieldId,
						field: field.name,
					});
					const values = parseStoryEventListDelta(reader, logParserStep);
					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataWrappedVector2ListFull: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['wrappedvector2list[]']);
					const count = reader.readInt32();
					if (count < 0) {
						throw new Error(`Invalid wrapped vector2 list count ${count} at ${reader.offset - 4}`);
					}

					const values: Vector2[][] = [];
					for (let i = 0; i < count; i++) {
						values.push(reader.readWrappedVector2List());
					}

					pushPlayerDataEvent(field.name, values);
					break;
				}

				case entryTypeSilk.PlayerDataWrappedVector2ListDelta: {
					const fieldId = reader.readUint16();
					const field = resolvePlayerDataField(fieldId);
					reader.logState = field?.name;
					trackedField = field?.name;
					if (!field) {
						break;
					}
					throwIfFieldTypeMismatch(entryType, field, fieldId, ['wrappedvector2list[]']);
					logParserStep('wrapped_vector2_list_delta_start', {
						fieldId,
						field: field.name,
					});
					const values = parseWrappedVector2ListDelta(reader, logParserStep);
					pushPlayerDataEvent(field.name, values);
					break;
				}
				case entryTypeSilk.SceneDataBool: {
					const sceneName = reader.readStringWithId(stringIdMappingSilk.sceneName) ?? '';
					const key = reader.readStringWithId(stringIdMappingSilk.sceneDataBool) ?? '';
					const value = reader.readUint8() === 1;

					const event = new SceneDataEventSilk(null, 'bool', sceneName, key, value, ctx);
					pushEvent(event, {
						sceneName,
						key,
						value,
					});
					logParserStep('scene_data_bool', {
						sceneName,
						key,
						value,
					});
					break;
				}
				case entryTypeSilk.SceneDataInt: {
					const sceneName = reader.readStringWithId(stringIdMappingSilk.sceneName) ?? '';
					const key = reader.readStringWithId(stringIdMappingSilk.sceneDataInt) ?? '';
					const value = reader.readInt32();

					const event = new SceneDataEventSilk(null, 'int', sceneName, key, value, ctx);
					pushEvent(event, {
						sceneName,
						key,
						value,
					});
					logParserStep('scene_data_int', {
						sceneName,
						key,
						value,
					});
					break;
				}
				case entryTypeSilk.SceneDataGeoRock: {
					const sceneName = reader.readStringWithId(stringIdMappingSilk.sceneName) ?? '';
					const key = reader.readStringWithId(stringIdMappingSilk.sceneDataGeoRock) ?? '';
					const value = reader.readInt32();

					const event = new SceneDataEventSilk(null, 'geoRock', sceneName, key, value, ctx);
					pushEvent(event, {
						sceneName,
						key,
						value,
					});
					logParserStep('scene_data_georock', {
						sceneName,
						key,
						value,
					});
					break;
				}
				default: {
					typeCheckNever(entryType);
					unknownEvents++;
					logParserStep('unknown_entry_type', { entryType, offset: reader.offset });
					console.error('Unknown entryType', entryType, 'at offset', reader.offset);

					// stop parsing to avoid desync
					reader.offset = reader.byteLength;
					break;
				}
			}
			// track storage
			const trackStorageKey = trackedField ? `${entryTypeName}_${trackedField}` : entryTypeName;
			storageStats.addStat(trackStorageKey, 1, reader.offset - entryOffset);
			logParserStep('entry_tracked', {
				entryType: entryTypeName,
				field: trackedField,
				size: reader.offset - entryOffset,
			});
		}
	} catch (e) {
		logParserStep('parse_error', { offset: reader.offset, error: e });
		console.error('Parsing error at offset', reader.offset, e);
		parsingErrors++;
	}

	logParserStep('parse_complete', {
		events: events.length,
		unknownEvents,
		parsingErrors,
		combinedPartNumber,
		recordingFileVersion,
		hkVizModVersion,
	});

	return new ParsedRecordingSilk(
		events,
		unknownEvents,
		parsingErrors,
		combinedPartNumber,
		recordingFileVersion,
		hkVizModVersion,
		storageStats,
	);
}
