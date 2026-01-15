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

export class ParseRecordingFileContext {
	unknownEvents = 0;
	parsingErrors = 0;

	lastSceneEvent: SceneEvent | undefined = undefined;
	previousPlayerPosition: Vector2 | undefined = undefined;
	previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	previousTimestamp: number | undefined = undefined;

	// defaults to 0.0.0 since in early version of the mod, the version was only
	// written at the beginning of a session, not for each part
	currentRecordingFileVersion: RecordingFileVersion = '0.0.0';
}

export function parseRecordingFile(
	recordingFileContent: string,
	combinedPartNumber: number,
	context?: ParseRecordingFileContext,
): RecordingEvent[] {
	const lines = recordingFileContent.split('\n');
	const events: RecordingEvent[] = [];

	const ctx = context ?? new ParseRecordingFileContext();

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
				if (ctx.previousTimestamp === undefined) {
					throw new Error('Relative timestamp found, but no previous timestamp found');
				}
				timestamp = ctx.previousTimestamp!;
			} else if (isRelativeTimestamp) {
				if (ctx.previousTimestamp == null) {
					throw new Error('Relative timestamp found, but no previous timestamp found');
				}
				timestamp = ctx.previousTimestamp + parseInt(timestampStr);
			} else {
				timestamp = parseInt(timestampStr);
			}
			ctx.previousTimestamp = timestamp;

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
							previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
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
							previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
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
					ctx.lastSceneEvent = new SceneEvent({
						timestamp,
						sceneName: args[0]!,
						originOffset: undefined,
						sceneSize: undefined,
					});
					ctx.previousPlayerPosition = undefined;
					events.push(ctx.lastSceneEvent);
					break;
				}
				case EVENT_PREFIXES.ROOM_DIMENSIONS: {
					if (ctx.lastSceneEvent) {
						let originOffset: Vector2;
						let sceneSize: Vector2;

						if (isVersion0xx(ctx.currentRecordingFileVersion)) {
							originOffset = parseVector2_v0(args[0]!, args[1]!);
							sceneSize = parseVector2_v0(args[2]!, args[3]!);
						} else {
							originOffset = parseVector2_v1(args[0]!);
							sceneSize = parseVector2_v1(args[1]!);
						}

						// for some reason in Abyss_10 (the scene right to the light house),
						// the origin offset is always first set to correct values, and then shortly after to zero
						if (
							(!ctx.lastSceneEvent.originOffset && !ctx.lastSceneEvent.sceneSize) ||
							(!originOffset.isZero() && !sceneSize.isZero())
						) {
							ctx.lastSceneEvent.originOffset = originOffset;
							ctx.lastSceneEvent.sceneSize = sceneSize;
						}
					}
					break;
				}
				case EVENT_PREFIXES.ENTITY_POSITIONS: {
					if (ctx.lastSceneEvent) {
						const position: Vector2 | undefined =
							args[0] === '='
								? ctx.previousPlayerPosition
								: isVersion0xx(ctx.currentRecordingFileVersion)
									? parseVector2_v0(args[0]!, args[1]!)
									: parseVector2_v1(args[0]!, 1 / 10);
						if (!position) {
							continue;
							// throw new Error('Could not assign player position to player position event');
						}
						ctx.previousPlayerPosition = position;
						ctx.previousPlayerPositionEvent = new PlayerPositionEvent({
							timestamp,
							position,
							sceneEvent: ctx.lastSceneEvent,
						});
						events.push(ctx.previousPlayerPositionEvent);
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
						ctx.currentRecordingFileVersion = version;
					} else {
						console.error(
							`Unknown recording file version ${version} falling back to newest known version ${newestRecordingFileVersion}`,
						);
						ctx.currentRecordingFileVersion = newestRecordingFileVersion;
					}

					events.push(
						new RecordingFileVersionEvent({
							timestamp,
							version: ctx.currentRecordingFileVersion as RecordingFileVersion,
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
							previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
						}),
					);
					break;
				}
				case EVENT_PREFIXES.SPELL_UP: {
					events.push(
						new SpellUpEvent({
							timestamp,
							previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
						}),
					);
					break;
				}
				case EVENT_PREFIXES.SPELL_DOWN: {
					events.push(
						new SpellDownEvent({
							timestamp,
							previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
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
					ctx.unknownEvents++;
				}
			}
		} catch (e) {
			console.error(
				`Error while parsing line ${i}: |${line}| using file version ${ctx.currentRecordingFileVersion} in part number ${combinedPartNumber}`,
				e,
			);

			((window as any).errorLines = (window as any).errorLines ?? []).push(line);
			ctx.parsingErrors++;
		}
		i++;
	}

	return events;
}
