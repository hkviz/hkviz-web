import { isPlayerDataEventOfFieldSilk } from '~/lib/game-data/silk-data/player-data-silk';
import { PlayerDataFieldNameSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
import { playerPositionToMapPositionSilk } from '~/lib/game-data/silk-data/player-position-silk';
import { raise } from '../../../util';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { frameEndEventPlayerDataFieldsSetSilk, FrameEndEventSilk } from '../events-silk/frame-end-event-silk';
import { PlayerDataEventSilk } from '../events-silk/player-data-event-silk';
import { CombinedRecordingSilk, ParsedRecordingSilk, RecordingEventSilk } from './recording-silk';

export function combineRecordingsSilk(recordings: ParsedRecordingSilk[]): CombinedRecordingSilk {
	const events: RecordingEventSilk[] = [];
	let msIntoGame = 0;
	let lastTimestamp: number =
		recordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

	let isPaused = false;
	let isTransitioning = false;
	let previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	let previousPositionEventWithChangedPosition: PlayerPositionEvent | null = null;
	let previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
	let previousSceneEvent: SceneEvent | null = null;

	const lastPlayerDataEventByField = new Map<PlayerDataFieldNameSilk, PlayerDataEventSilk<PlayerDataFieldNameSilk>>();
	function getLastPlayerDataEventOfField<K extends PlayerDataFieldNameSilk>(field: K): PlayerDataEventSilk<K> | null {
		return (lastPlayerDataEventByField.get(field) as any) ?? null;
	}

	const allHkVizModVersions = new Set<string>();

	let createFrameEndEvent = false;
	let previousFrameEndEvent: FrameEndEventSilk | null = null;
	let previousEvent: RecordingEventSilk | null = null;

	const eventCreationContext = new EventCreationContext();

	for (const recording of recordings.sort((a, b) => a.combinedPartNumber! - b.combinedPartNumber!)) {
		const _recordingFileVersion = recording.recordingFileVersion;
		allHkVizModVersions.add(recording.hkVizModVersion ?? 'Unknown version');

		for (const event of recording.events) {
			// first create frame end event if new time + needed
			// since later last player data is overwritten
			if (createFrameEndEvent && previousEvent && event.timestamp !== previousEvent.timestamp) {
				eventCreationContext.msIntoGame = msIntoGame;
				eventCreationContext.timestamp = previousEvent.timestamp;
				const frameEndEvent: FrameEndEventSilk = new FrameEndEventSilk(
					getLastPlayerDataEventOfField,
					previousFrameEndEvent,
					eventCreationContext,
				);

				events.push(frameEndEvent);
				previousFrameEndEvent = frameEndEvent;
				createFrameEndEvent = false;
			}

			if (event instanceof PlayerPositionEvent) {
				if (isTransitioning) {
					continue;
				}
				event.calcMapPosition(playerPositionToMapPositionSilk);
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
			} else if (event instanceof SceneEvent) {
				previousSceneEvent = event;
			} else if (event instanceof PlayerDataEventSilk) {
				event.previousPlayerPositionEvent = previousPlayerPositionEvent;
				event.previousPlayerDataEventOfField = getLastPlayerDataEventOfField(event.fieldName);
				lastPlayerDataEventByField.set(event.fieldName, event);
				if (isPlayerDataEventOfFieldSilk(event, 'heroState_isPaused')) {
					isPaused = event.value;
				} else if (isPlayerDataEventOfFieldSilk(event, 'heroState_transitioning')) {
					isTransitioning = event.value;
				}
				createFrameEndEvent = createFrameEndEvent || frameEndEventPlayerDataFieldsSetSilk.has(event.fieldName);
			}

			if (!isPaused) {
				const diff = event.timestamp - lastTimestamp;
				const msSinceLastPositionChange =
					event.timestamp - (previousPositionEventWithChangedPosition?.timestamp ?? 0);

				// starting with 10 seconds of no events, the time is not counted
				// this might happen, because sb closed their laptop
				// without closing game, and when opening the laptop again, the recorder just continues.
				const skipTimeDeltaBecauseOfNoEvents = diff > 10 * 1000;

				// even when we have a position change, if it hasn't changed for 30 seconds, one probably has left
				// game open accidentally. So time is not counted.
				// TODO add option to UI to make this filtering optional.
				const skipTimeDeltaBecauseNoPositionChange = msSinceLastPositionChange > 30 * 1000;

				if (!skipTimeDeltaBecauseOfNoEvents && !skipTimeDeltaBecauseNoPositionChange) {
					msIntoGame += event.timestamp - lastTimestamp;
				}
			}
			lastTimestamp = event.timestamp;
			event.msIntoGame = msIntoGame;

			events.push(event);
			previousEvent = event;
		}
	}
	(window as any).hkvizEvents = () => events;

	return new CombinedRecordingSilk(
		events,
		recordings.reduce((sum, recording) => sum + recording.unknownEvents, 0),
		recordings.reduce((sum, recording) => sum + recording.parsingErrors, 0),
		[...allHkVizModVersions].sort(),
	);
}
