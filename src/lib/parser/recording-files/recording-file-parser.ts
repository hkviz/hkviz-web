import { heroStateFields, heroStatesSkipParsing } from '../hero-state';
import { Vector2 } from '../hk-types';
import { parsePlayerDataFieldValue, playerDataFields } from '../player-data';
import {
	type RecordingFileVersion,
	isKnownRecordingFileVersion,
	isVersion0xx,
	newestRecordingFileVersion,
} from '../recording-file-version';
import { raise, typeCheckNever } from '../util';
import {
	EVENT_PREFIXES,
	type EventPrefix,
	PARTIAL_EVENT_PREFIXES,
	type PartialEventPrefix,
} from './event-type-prefixes';
import {
	HKVizModVersionEvent,
	type ModInfo,
	ModdingInfoEvent,
	PlayerDataEvent,
	PlayerPositionEvent,
	SceneEvent,
} from './events';
import {
	HeroStateEvent,
	ParsedRecording,
	type RecordingEvent,
	RecordingFileVersionEvent,
	SpellDownEvent,
	SpellFireballEvent,
	SpellUpEvent,
} from './recording';

// any newer version will always log using . instead of ,
function parseFloatAnyCommaVersion_v0(value: string) {
	return parseFloat(value.replace(',', '.'));
}

// Do not use for recording file version >= 1.0.0
// any newer version will log vectors using 0.0,0.0 format instead of 0[.,]0;0[.,]0
function parseVector2_v0(x: string, y: string) {
	return new Vector2(parseFloatAnyCommaVersion_v0(x), parseFloatAnyCommaVersion_v0(y));
}

function parseVector2_v1(str: string, factor = 1) {
	const [x, y] = str.split(',');
	return new Vector2(
		parseFloat(x ?? raise(new Error('Could not parse vector no value for x'))) * factor,
		parseFloat(y ?? raise(new Error('Could not parse vector no value for y'))) * factor,
	);
}

export function parseRecordingFile(recordingFileContent: string, combinedPartNumber: number): ParsedRecording {
	const lines = recordingFileContent.split('\n');
	const events: RecordingEvent[] = [];
	let unknownEvents = 0;
	let parsingErrors = 0;

	let lastSceneEvent: SceneEvent | undefined = undefined;
	let previousPlayerPosition: Vector2 | undefined = undefined;
	let previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	let previousTimestamp: number | undefined = undefined;

	// defaults to 0.0.0 since in early version of the mod, the version was only
	// written at the beginning of a session, not for each part
	let currentRecordingFileVersion: RecordingFileVersion = '0.0.0';

	let i = 0;
	LINE_LOOP: for (let line of lines) {
		try {
			// empty lines are skipped
			if (line == null || line === '' || line === '\r') continue LINE_LOOP;
			if (line.at(-1) == '\r') line = line.slice(0, -1);

			const [prefix, ...args] = line.replace(/\r/gi, '').split(';');
			if (prefix == null) throw new Error('No prefix found');
			const [eventType, timestampStr] = prefix.split(/[=+]/);
			if (eventType == null) throw new Error('No event type found');
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
			const partialEventType = eventType[0] as PartialEventPrefix;
			const eventTypeSuffix = () => eventType.slice(1);
			switch (partialEventType) {
				case PARTIAL_EVENT_PREFIXES.PLAYER_DATA_SHORTNAME: {
					const field = playerDataFields.byShortCode[eventTypeSuffix()];
					if (!field) throw new Error('Unknown player data field short code' + eventTypeSuffix());

					const value = parsePlayerDataFieldValue(field, args.length === 1 ? args[0]! : args.join(';'));
					// TODO
					events.push(
						new PlayerDataEvent({
							timestamp,
							field,

							value,
							previousPlayerPositionEvent: previousPlayerPositionEvent,
							previousPlayerDataEventOfField: null, // filled in combiner
						}),
					);
					continue LINE_LOOP;
				}
				case PARTIAL_EVENT_PREFIXES.PLAYER_DATA_LONGNAME: {
					// TODO
					continue LINE_LOOP;
				}
				case PARTIAL_EVENT_PREFIXES.HERO_CONTROLLER_STATE_SHORTNAME: {
					const field = heroStateFields.byShortCode[eventTypeSuffix()];
					if (!field) throw new Error('Unknown hero controller field short code' + eventTypeSuffix());
					if (heroStatesSkipParsing.has(field)) continue LINE_LOOP;
					events.push(
						new HeroStateEvent({
							timestamp,
							field,
							value: args[0] === '1',
							previousPlayerPositionEvent: previousPlayerPositionEvent,
						}),
					);
					continue LINE_LOOP;
				}
				case PARTIAL_EVENT_PREFIXES.HERO_CONTROLER_STATE_LONGNAME: {
					// TODO
					continue LINE_LOOP;
				}
				default: {
					typeCheckNever(partialEventType);
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
					previousPlayerPosition = undefined;
					events.push(lastSceneEvent);
					break;
				}
				case EVENT_PREFIXES.ROOM_DIMENSIONS: {
					if (lastSceneEvent) {
						let originOffset: Vector2;
						let sceneSize: Vector2;

						if (isVersion0xx(currentRecordingFileVersion)) {
							originOffset = parseVector2_v0(args[0]!, args[1]!);
							sceneSize = parseVector2_v0(args[2]!, args[3]!);
						} else {
							originOffset = parseVector2_v1(args[0]!);
							sceneSize = parseVector2_v1(args[1]!);
						}

						// for some reason in Abyss_10 (the scene right to the light house),
						// the origin offset is always first set to correct values, and then shortly after to zero
						if (
							(!lastSceneEvent.originOffset && !lastSceneEvent.sceneSize) ||
							(!originOffset.isZero() && !sceneSize.isZero())
						) {
							lastSceneEvent.originOffset = originOffset;
							lastSceneEvent.sceneSize = sceneSize;
						}
					}
					break;
				}
				case EVENT_PREFIXES.ENTITY_POSITIONS: {
					if (lastSceneEvent) {
						const position: Vector2 | undefined =
							args[0] === '='
								? previousPlayerPosition
								: isVersion0xx(currentRecordingFileVersion)
									? parseVector2_v0(args[0]!, args[1]!)
									: parseVector2_v1(args[0]!, 1 / 10);
						if (!position) {
							continue;
							// throw new Error('Could not assign player position to player position event');
						}
						previousPlayerPosition = position;
						previousPlayerPositionEvent = new PlayerPositionEvent({
							timestamp,
							position,
							sceneEvent: lastSceneEvent,
						});
						events.push(previousPlayerPositionEvent);
					}
					break;
				}
				case EVENT_PREFIXES.DEPRECATED_HOLLOW_KNIGHT_VERSION: {
					// Not used. Correct version logged as part of player data
					break;
				}
				case EVENT_PREFIXES.HZVIZ_MOD_VERSION: {
					events.push(new HKVizModVersionEvent({ timestamp, version: args[0] ?? 'Unknown version' }));
					break;
				}
				case EVENT_PREFIXES.MODDING_INFO: {
					const mods: ModInfo[] = args
						.filter((it) => it)
						.map((it) => {
							const split = it.split(':');
							const base = {
								name: split[0] ?? 'Unnamed mod',
								versions: [split[1] ?? 'Unknown version'],
							};
							return split.length === 2
								? base
								: { ...base, enabled: split[2]?.[0] === '1', errorCode: split[2]?.[1] };
						});
					events.push(
						new ModdingInfoEvent({
							timestamp,
							mods,
						}),
					);
					break;
				}
				case EVENT_PREFIXES.RECORDING_FILE_VERSION: {
					const version = args[0]!;

					if (isKnownRecordingFileVersion(version)) {
						currentRecordingFileVersion = version;
					} else {
						console.error(
							`Unknown recording file version ${version} falling back to newest known version ${newestRecordingFileVersion}`,
						);
						currentRecordingFileVersion = newestRecordingFileVersion;
					}

					events.push(
						new RecordingFileVersionEvent({
							timestamp,
							version: currentRecordingFileVersion as RecordingFileVersion,
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
					events.push(
						new SpellFireballEvent({
							timestamp,
							previousPlayerPositionEvent: previousPlayerPositionEvent,
						}),
					);
					break;
				}
				case EVENT_PREFIXES.SPELL_UP: {
					events.push(
						new SpellUpEvent({
							timestamp,
							previousPlayerPositionEvent: previousPlayerPositionEvent,
						}),
					);
					break;
				}
				case EVENT_PREFIXES.SPELL_DOWN: {
					events.push(
						new SpellDownEvent({
							timestamp,
							previousPlayerPositionEvent: previousPlayerPositionEvent,
						}),
					);
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
				case EVENT_PREFIXES.ENEMY_START: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.ENEMY_HEALTH: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.GAME_STATE: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.ACTIVE_INPUT_DEVICE: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.DREAM_NAIL_SLASH: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.DREAM_NAIL_GATE_WARP: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.DREAM_NAIL_SET_GATE: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.TAKE_DAMAGE_CALLED: {
					// TODO
					break;
				}
				case EVENT_PREFIXES.TAKE_HEALTH_CALLED: {
					// TODO
					break;
				}
				default: {
					typeCheckNever(eventTypePrefix);
					console.log(`Unexpected event type |${eventType}| ignoring line |${line}|`);
					unknownEvents++;
				}
			}
		} catch (e) {
			console.error(
				`Error while parsing line ${i}: |${line}| using file version ${currentRecordingFileVersion} in part number ${combinedPartNumber}`,
				e,
			);

			((window as any).errorLines = (window as any).errorLines ?? []).push(line);
			parsingErrors++;
		}
		i++;
	}

	return new ParsedRecording(events, unknownEvents, parsingErrors, combinedPartNumber);
}
