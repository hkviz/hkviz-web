import { scale } from '../map-data/scaling';
import { getDefaultValue, playerDataFields, type PlayerDataField } from '../player-data/player-data';
import { isVersionBefore1_4_0 } from '../recording-file-version';
import { raise } from '../util';
import { ReadonlyArrayish } from '../util/array/append-only-signal-array';
import { CombineRecordingsContext } from './combine-recording-context';
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

/**
 *
 * @param combinedEvents combined events are written to this array
 * @param ctx
 * @param all if true, all scenes are added, if false, only scenes which are at least 2 seconds in the past are added
 */
function addScenesWhichWhereNotAdded(combinedEvents: RecordingEvent[], ctx: CombineRecordingsContext, all: boolean) {
	while (
		ctx.visitedScenesToCheckIfInPlayerData.length > 0 &&
		(all || ctx.visitedScenesToCheckIfInPlayerData[0]!.msIntoGame + 2000 < ctx.msIntoGame)
	) {
		const { sceneName, msIntoGame } = ctx.visitedScenesToCheckIfInPlayerData.shift()!;
		const previousScenesVisitedEvent = ctx.getPreviousPlayerData(playerDataFields.byFieldName.scenesVisited);
		const previousValue = previousScenesVisitedEvent?.value ?? [];

		if (!previousValue.includes(sceneName)) {
			const visitedScenesEvent = new PlayerDataEvent<typeof playerDataFields.byFieldName.scenesVisited>({
				timestamp: ctx.lastTimestamp,
				value: [...previousValue, sceneName],
				field: playerDataFields.byFieldName.scenesVisited,

				previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
				previousPlayerDataEventOfField: previousScenesVisitedEvent ?? null,
			});
			visitedScenesEvent.msIntoGame = msIntoGame;
			ctx.previousPlayerDataEventsByField.set(playerDataFields.byFieldName.scenesVisited, visitedScenesEvent);
			if (frameEndEventPlayerDataFields.has(playerDataFields.byFieldName.scenesVisited)) {
				ctx.createEndFrameEvent = true;
			}
			combinedEvents.push(visitedScenesEvent);
		}
	}
}

/**
 *
 * @param combinedEvents combined events are written to this array
 * @param uncombinedEvents events that are not yet combined
 * @param ctx
 * @param combinedPartNumber only relevant at first part, can be null for live recorded events
 */
function internalCombineRecordingEvents(
	combinedEvents: RecordingEvent[],
	uncombinedEvents: ReadonlyArrayish<RecordingEvent>,
	ctx: CombineRecordingsContext,
	combinedPartNumber: number | null,
) {
	for (const event of uncombinedEvents) {
		// create together player data event if needed
		// TODO might be good to exclude some fields here since they are updated very often and not needed
		// for the visualizations
		if (event.timestamp > ctx.lastTimestamp) {
			if (!ctx.hasCreatedFirstEndFrameEvent && combinedPartNumber === 1) {
				Object.values(playerDataFields.byFieldName).forEach((field) => {
					if (!ctx.previousPlayerDataEventsByField.has(field)) {
						// if part number = 1 all non default player data fields should have been added
						// so we can add default values for the rest
						const event = new PlayerDataEvent<PlayerDataField>({
							field,
							timestamp: 0,
							value: getDefaultValue(field),
						} as any);
						combinedEvents.push(event);
						ctx.previousPlayerDataEventsByField.set(field, event);
						if (frameEndEventPlayerDataFields.has(field)) {
							ctx.createEndFrameEvent = true;
						}
					}
				});
			}
			if (ctx.createEndFrameEvent) {
				const endFrameEvent: FrameEndEvent = new FrameEndEvent({
					timestamp: ctx.lastTimestamp,
					getPreviousPlayerData: ctx.getPreviousPlayerData,
					msIntoGame: ctx.msIntoGame,
					previousFrameEndEvent: ctx.previousFrameEndEvent,
					previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
					getPreviousHeroState: ctx.getPreviousHeroState,
				});
				// TODO test if this had an impact.
				ctx.hasCreatedFirstEndFrameEvent = true;
				ctx.previousFrameEndEvent = endFrameEvent;
				combinedEvents.push(endFrameEvent);
				ctx.createEndFrameEvent = false;
			}
		}

		// msIntoGame calculation
		if (event instanceof RecordingFileVersionEvent) {
			// time before the previous event and this event is not counted,
			// since either the session just started again, or pause has been active, or a scene has been loaded
			// TODO add remaining event checks
			// console.log('time between sessions not counted', event.timestamp - lastTimestamp);
			ctx.lastTimestamp = event.timestamp;
			ctx.isPaused = false;
			ctx.recordingFileVersion = event.version;
		} else if (event instanceof ModdingInfoEvent) {
			for (const mod of event.mods) {
				if (mod.enabled !== false) {
					const versions = ctx.allModVersions.get(mod.name) ?? new Set();
					mod.versions.forEach((v) => versions.add(v));
					ctx.allModVersions.set(mod.name, versions);
				}
			}
		} else if (event instanceof HKVizModVersionEvent) {
			ctx.allHkVizModVersions.add(event.version);
		} else if (event instanceof SceneEvent) {
			event.previousSceneEvent = ctx.previousSceneEvent;
			const previousCurrentBossSequenceEvent = ctx.getPreviousPlayerData(
				playerDataFields.byFieldName.currentBossSequence,
			);
			if (previousCurrentBossSequenceEvent?.value && !isPantheonRoom(event.sceneName)) {
				// pantheon stopped, but game does not change player data to reflect that
				// so a event is faked here

				const currentBossSequenceEvent = new PlayerDataEvent<
					typeof playerDataFields.byFieldName.currentBossSequence
				>({
					timestamp: ctx.lastTimestamp,
					value: null,
					field: playerDataFields.byFieldName.currentBossSequence,
					previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
					previousPlayerDataEventOfField: previousCurrentBossSequenceEvent ?? null,
				});
				currentBossSequenceEvent.msIntoGame = ctx.msIntoGame;
				ctx.previousPlayerDataEventsByField.set(
					playerDataFields.byFieldName.currentBossSequence,
					currentBossSequenceEvent,
				);
				combinedEvents.push(currentBossSequenceEvent);
			}

			const currentBossSequence =
				ctx.getPreviousPlayerData(playerDataFields.byFieldName.currentBossSequence)?.value ?? null;
			event.currentBossSequence = currentBossSequence;

			const visitedScenes = ctx.getPreviousPlayerData(playerDataFields.byFieldName.scenesVisited)?.value ?? [];

			// if scene is not in player data, it might still be added in a few seconds or so, but if its not
			// its added to the scenes below.
			if (!visitedScenes.includes(event.sceneName)) {
				ctx.visitedScenesToCheckIfInPlayerData.push({
					sceneName: event.sceneName,
					msIntoGame: ctx.msIntoGame,
				});
			}

			// in version < 1.4.0 the mod did not record the transitioning bool
			// therefore, here we try to detect player events which where transitioned to a new scene
			// and remove them:
			if (isVersionBefore1_4_0(ctx.recordingFileVersion) && ctx.previousPlayerPositionEvent) {
				const lastPlayerPositionEvent: PlayerPositionEvent = ctx.previousPlayerPositionEvent;
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
					combinedEvents.splice(combinedEvents.indexOf(currentPlayerPositionEvent), 1);
					currentPlayerPositionEvent = currentPlayerPositionEvent.previousPlayerPositionEvent;
				}
				// found first event with this x position (hopefully last position before transition)
				// now all other events which have a player position reference should instead
				// reference the new last one
				ctx.previousPlayerPositionEvent = currentPlayerPositionEvent;
				ctx.previousPlayerPositionEventWithMapPosition = currentPlayerPositionEvent?.mapPosition
					? currentPlayerPositionEvent
					: (currentPlayerPositionEvent?.previousPlayerPositionEventWithMapPosition ?? null);

				if (currentPlayerPositionEvent) {
					const startIndex = combinedEvents.indexOf(currentPlayerPositionEvent) + 1;
					for (let i = startIndex; i < combinedEvents.length; i++) {
						const event = combinedEvents[i];
						if (event && 'previousPlayerPositionEvent' in event) {
							event.previousPlayerPositionEvent = currentPlayerPositionEvent;
						}
						if (event && 'previousPlayerPositionEventWithMapPosition' in event) {
							event.previousPlayerPositionEventWithMapPosition =
								ctx.previousPlayerPositionEventWithMapPosition;
						}
						if (event && 'mapDistanceToPrevious' in event) {
							// event.mapDistanceToPrevious = null;
						}
					}
				}
			}
			ctx.previousSceneEvent = event;
		} else if (event instanceof HeroStateEvent) {
			if (event.field.name === 'isPaused') {
				ctx.isPaused = event.value;
				if (!ctx.isPaused) {
					ctx.lastTimestamp = event.timestamp;
				}
			} else if (event.field.name === 'transitioning') {
				ctx.isTransitioning = event.value;
				ctx.lastTimestamp = event.timestamp;
			}
			ctx.previousHeroStateByField.set(event.field, event);
			if (frameEndEventHeroStateFields.has(event.field)) {
				ctx.createEndFrameEvent = true;
			}
		} else {
			if (event instanceof PlayerPositionEvent) {
				if (ctx.isTransitioning) {
					continue;
				}
				event.calcMapPosition();
				const playerPositionChanged =
					ctx.previousPositionEventWithChangedPosition?.position?.equals(event.position) !== true;
				if (playerPositionChanged) {
					ctx.previousPositionEventWithChangedPosition = event;
				}
				event.previousPlayerPositionEvent = ctx.previousPlayerPositionEvent;
				event.previousPlayerPositionEventWithMapPosition = ctx.previousPlayerPositionEventWithMapPosition;
				if (event.mapPosition != null && ctx.previousPlayerPositionEventWithMapPosition?.mapPosition != null) {
					event.mapDistanceToPrevious = ctx.previousPlayerPositionEventWithMapPosition.mapPosition.distanceTo(
						event.mapPosition,
					);
					event.isJump = (event.mapDistanceToPrevious ?? 0) > scale(1.5);
				}
				if (event.mapPosition != null) {
					ctx.previousPlayerPositionEventWithMapPosition = event;
				}
				ctx.previousPlayerPositionEvent = event;
			}

			if (!ctx.isPaused) {
				const diff = event.timestamp - ctx.lastTimestamp;
				const msSinceLastPositionChange =
					event.timestamp - (ctx.previousPositionEventWithChangedPosition?.timestamp ?? 0);

				// starting with 10 seconds of no events, the time is not counted
				// this might happen, because sb closed their laptop / turned off their pc,
				// without closing Hollow Knight, and when opening the laptop again, the recorder just continues.
				const skipTimeDeltaBecauseOfNoEvents = diff > 10 * 1000;

				// even when we have a position change, if it hasn't changed for 30 seconds, one probably has left
				// hollow knight open accidentally. So time is not counted.
				// TODO add option to UI to make this filtering optional.
				const skipTimeDeltaBecauseNoPositionChange = msSinceLastPositionChange > 30 * 1000;

				if (!skipTimeDeltaBecauseOfNoEvents && !skipTimeDeltaBecauseNoPositionChange) {
					ctx.msIntoGame += event.timestamp - ctx.lastTimestamp;
				}
			}
			ctx.lastTimestamp = event.timestamp;
		}
		event.msIntoGame = ctx.msIntoGame;

		// previousPlayerDataEventsByField
		if (event instanceof PlayerDataEvent) {
			event.previousPlayerDataEventOfField = ctx.previousPlayerDataEventsByField.get(event.field) ?? null;
			ctx.previousPlayerDataEventsByField.set(event.field, event);
			if (frameEndEventPlayerDataFields.has(event.field)) {
				ctx.createEndFrameEvent = true;
			}

			if (isPlayerDataEventOfField(event, playerDataFields.byFieldName.currentBossSequence)) {
				const sceneEvent = ctx.previousPlayerPositionEvent?.sceneEvent;
				if (sceneEvent && isPantheonRoom(sceneEvent.sceneName)) {
					sceneEvent.currentBossSequence = event.value;
				}
			}

			if (isPlayerDataEventWithFieldType(event, 'List`1')) {
				event.value = event.value.flatMap((it) =>
					it === '::' ? (event.previousPlayerDataEventOfField?.value ?? []) : [it],
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

		combinedEvents.push(event);
		addScenesWhichWhereNotAdded(combinedEvents, ctx, false);
	}
}

/**
 * Called to combine initially parsed static recording files (i.e. not live part of a gameplay)
 * @param recordings
 * @returns newly created combined recording
 */
export function combineRecordings(recordings: ParsedRecording[]): CombinedRecording {
	const combinedEvents: RecordingEvent[] = [];

	const ctx = new CombineRecordingsContext();
	ctx.lastTimestamp = recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

	for (const recording of recordings.sort((a, b) => a.combinedPartNumber! - b.combinedPartNumber!)) {
		internalCombineRecordingEvents(combinedEvents, recording.events, ctx, recording.combinedPartNumber);
	}
	addScenesWhichWhereNotAdded(combinedEvents, ctx, true);
	// there might not have been a end frame event for a bit at the end, so we duplicate the last one
	// so graphs can depend on there being one at the end of the msIntoGame
	if (ctx.previousFrameEndEvent) {
		combinedEvents.push(
			new FrameEndEvent({
				timestamp: ctx.lastTimestamp,
				getPreviousPlayerData: ctx.getPreviousPlayerData,
				msIntoGame: ctx.msIntoGame,
				previousFrameEndEvent: ctx.previousFrameEndEvent,
				previousPlayerPositionEvent: ctx.previousPlayerPositionEvent,
				getPreviousHeroState: ctx.getPreviousHeroState,
			}),
		);
	}

	return new CombinedRecording(
		combinedEvents,
		recordings.reduce((sum, recording) => sum + recording.unknownEvents, 0),
		recordings.reduce((sum, recording) => sum + recording.parsingErrors, 0),
		[...ctx.allModVersions.entries()].map(([name, versions]) => ({
			name,
			versions: [...versions.values()].sort(),
		})),
		[...ctx.allHkVizModVersions].sort(),
		ctx,
		// todo make not live when not live?
		true,
		false,
	);
}

export function combineRecordingsAppend(recording: CombinedRecording, events: RecordingEvent[]) {
	const ctx = recording.combiningContext;
	const combinedEvents: RecordingEvent[] = [];

	internalCombineRecordingEvents(combinedEvents, events, ctx, null);
	recording.append(combinedEvents);
}
