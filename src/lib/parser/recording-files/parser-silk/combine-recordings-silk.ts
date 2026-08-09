import { isPlayerDataEventOfFieldSilk } from '~/lib/game-data/silk-data/player-data/player-data-silk';
import type { PlayerDataFieldNameSilk } from '~/lib/game-data/silk-data/player-data/player-data-silk.generated';
import { playerPositionToMapPositionSilk } from '~/lib/game-data/silk-data/player-position-silk';
import { raise } from '~/lib/util/other';
import { EventCreationContext, type RestorePointInfo } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { frameEndEventPlayerDataFieldsSetSilk, FrameEndEventSilk } from '../events-silk/frame-end-event-silk';
import { PlayerDataEventSilk } from '../events-silk/player-data-event-silk';
import { collectionDiffApply } from './collection-parsing/diff-types-shared';
import { BEFORE_RECORDING_STEP_MS } from '../parser-shared/before-recording';
import { RestorePointFinishEventSilk, RestorePointStartEventSilk } from '../events-silk/restore-point-event-silk';
import type { ParsedRecordingSilk, RecordingEventSilk } from './recording-silk';
import { CombinedRecordingSilk } from './recording-silk';
import { combineStorageStats } from './storage-stats';

// Restore point history only ever belongs in the run's first file. If runs get combined (multiple
// devices not recognizing a single run, or the mod losing track of an already-recorded profile and
// backfilling again), a later "first file" may carry its own duplicate backfill - drop those, and
// pull out the one from the actual first file to give it negative msIntoGame further down.
// Restore point blocks always sit contiguously at the front of a file's events (see
// parseRecordingFileSilk), so this just consumes the leading Start/Finish-bracketed run.
function extractLeadingRestorePointEvents(sortedRecordings: ParsedRecordingSilk[]): RecordingEventSilk[] {
	let firstFileRestorePointEvents: RecordingEventSilk[] = [];
	for (const recording of sortedRecordings) {
		let end = 0;
		while (recording.events[end] instanceof RestorePointStartEventSilk) {
			end++;
			while (!(recording.events[end] instanceof RestorePointFinishEventSilk)) {
				end++;
			}
			end++;
		}
		if (end === 0) continue;

		const leadingEvents = recording.events.splice(0, end);
		if (recording.combinedPartNumber === 1) {
			firstFileRestorePointEvents = leadingEvents;
		}
	}
	return firstFileRestorePointEvents;
}

interface RestorePointBlock {
	number: number;
	date: string;
	events: RecordingEventSilk[];
}

function splitIntoBlocks(events: RecordingEventSilk[]): RestorePointBlock[] {
	const blocks: RestorePointBlock[] = [];
	let i = 0;
	while (i < events.length) {
		const startEvent = events[i];
		if (!(startEvent instanceof RestorePointStartEventSilk)) {
			throw new Error(`Expected a restore point start event at index ${i}`);
		}
		i++;

		const blockEvents: RecordingEventSilk[] = [];
		while (!(events[i] instanceof RestorePointFinishEventSilk)) {
			blockEvents.push(events[i]!);
			i++;
		}
		i++; // skip the finish marker

		blocks.push({ number: startEvent.number, date: startEvent.date, events: blockEvents });
	}
	return blocks;
}

// Resolves collectionDiffApply for every restore point event, in place. Needed before anything can
// read a resolved field value (e.g. scenesVisited below) - these events skip the main loop further
// down, which is where this normally happens for live events.
function resolveRestorePointEventValues(events: RecordingEventSilk[]): void {
	for (const event of events) {
		if (event instanceof PlayerDataEventSilk) {
			event.value = collectionDiffApply(event.previousPlayerDataEventOfField?.value, event.value);
		}
	}
}

// Diffs each restore point's resolved scenesVisited set against the previous restore point's (the
// very first restore point diffs against an empty set), and synthesizes a virtual scene visit
// (SceneEvent + scenesVisited snapshot, mirroring combineRecordingsHollow's pre-recording guesses)
// for every newly-discovered scene, labeled here as R<n>-<t>: n is the restore point's own number, t
// counts down to 0 at the scene visited right before that restore point's own snapshot. One more
// diff is done after the last block, against firstLiveScenesVisited (the first live, non-restore-point
// scenesVisited value) - covers any scenes visited between the last restore point and the start of
// live recording, and its virtual scenes land after all restore point content but still before any
// live event. Set iteration order is used as the visit order - not formally guaranteed by .NET's
// HashSet<T>, but stable in practice for sets this small (see mod).
// Negative msIntoGame/timestamp are assigned across the whole flattened result: per block, oldest
// first, its virtual scene visits (t descending) followed by its own real snapshot, then the bridge
// diff's virtual scenes last - same fixed-step scheme as combineRecordingsHollow. The Start/Finish
// markers themselves are dropped here - they're only meant for parsing/combining, not the timeline.
function buildRestorePointTimeline(
	restorePointEvents: RecordingEventSilk[],
	firstLiveScenesVisited: Set<string>,
): RecordingEventSilk[] {
	resolveRestorePointEventValues(restorePointEvents);
	const blocks = splitIntoBlocks(restorePointEvents);

	let previousScenesVisited = new Set<string>();
	const blockNewScenes = blocks.map((block) => {
		const scenesVisitedEvent = block.events.findLast(
			(event): event is PlayerDataEventSilk<'scenesVisited'> =>
				event instanceof PlayerDataEventSilk && event.fieldName === 'scenesVisited',
		);
		const currentScenesVisited = scenesVisitedEvent?.value ?? previousScenesVisited;
		const newScenes = [...currentScenesVisited].filter((scene) => !previousScenesVisited.has(scene));
		previousScenesVisited = currentScenesVisited;
		return newScenes;
	});

	const bridgeNewScenes = [...firstLiveScenesVisited].filter((scene) => !previousScenesVisited.has(scene));

	const totalSlots =
		blocks.reduce((sum, block, i) => sum + blockNewScenes[i]!.length + (block.events.length > 0 ? 1 : 0), 0) +
		bridgeNewScenes.length;
	let msIntoGame = -totalSlots * BEFORE_RECORDING_STEP_MS;
	let timestamp = (restorePointEvents[0]?.timestamp ?? 0) + msIntoGame;
	const ctx = new EventCreationContext();

	const result: RecordingEventSilk[] = [];
	let previousSceneEvent: SceneEvent | null = null;
	const scenesVisitedSoFar: string[] = [];

	const pushVirtualSceneVisit = (scene: string, restorePoint: RestorePointInfo) => {
		scenesVisitedSoFar.push(scene);
		msIntoGame += BEFORE_RECORDING_STEP_MS;
		timestamp += BEFORE_RECORDING_STEP_MS;
		ctx.msIntoGame = msIntoGame;
		ctx.timestamp = timestamp;
		ctx.restorePoint = restorePoint;
		const sceneEvent = new SceneEvent(scene, undefined, undefined, ctx);
		sceneEvent.previousSceneEvent = previousSceneEvent;
		previousSceneEvent = sceneEvent;
		result.push(sceneEvent);
		result.push(new PlayerDataEventSilk(null, null, 'scenesVisited', new Set(scenesVisitedSoFar), ctx));
	};

	blocks.forEach((block, i) => {
		for (const scene of blockNewScenes[i]!) {
			pushVirtualSceneVisit(scene, { number: block.number, date: block.date });
		}

		if (block.events.length > 0) {
			msIntoGame += BEFORE_RECORDING_STEP_MS;
			for (const event of block.events) {
				event.msIntoGame = msIntoGame;
				result.push(event);
			}
		}
	});

	// the bridge diff conceptually still belongs to the last restore point - it's the same
	// reconstructed-from-that-snapshot knowledge, just extended forward to live recording's start
	const lastBlock = blocks[blocks.length - 1]!;
	for (const scene of bridgeNewScenes) {
		pushVirtualSceneVisit(scene, { number: lastBlock.number, date: lastBlock.date });
	}

	return result;
}

export function combineRecordingsSilk(recordings: ParsedRecordingSilk[]): CombinedRecordingSilk {
	const events: RecordingEventSilk[] = [];
	let msIntoGame = 0;
	const sortedRecordings = recordings.sort((a, b) => a.combinedPartNumber! - b.combinedPartNumber!);
	const restorePointEvents = extractLeadingRestorePointEvents(sortedRecordings);
	let lastTimestamp: number =
		sortedRecordings[0]?.events?.[0]?.timestamp ?? raise(new Error('No events found in first recording'));

	let isPaused = false;
	let isTransitioning = false;
	let previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	let previousPositionEventWithChangedPosition: PlayerPositionEvent | null = null;
	let previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
	let previousSceneEvent: SceneEvent | null = null;
	// first live (non-restore-point) scenesVisited value - bridges the gap between the last restore
	// point and the start of live recording, see buildRestorePointTimeline
	let firstLiveScenesVisited: Set<string> | null = null;

	const lastPlayerDataEventByField = new Map<PlayerDataFieldNameSilk, PlayerDataEventSilk<PlayerDataFieldNameSilk>>();
	function getLastPlayerDataEventOfField<K extends PlayerDataFieldNameSilk>(field: K): PlayerDataEventSilk<K> | null {
		return (lastPlayerDataEventByField.get(field) as any) ?? null;
	}

	const allHkVizModVersions = new Set<string>();

	let createFrameEndEvent = false;
	let previousFrameEndEvent: FrameEndEventSilk | null = null;
	let previousEvent: RecordingEventSilk | null = null;

	const eventCreationContext = new EventCreationContext();

	for (const recording of sortedRecordings) {
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
				const previousPlayerDataEventOfField = getLastPlayerDataEventOfField(event.fieldName);

				event.previousPlayerPositionEvent = previousPlayerPositionEvent;
				event.previousPlayerDataEventOfField = previousPlayerDataEventOfField;
				event.value = collectionDiffApply(previousPlayerDataEventOfField?.value, event.value);
				lastPlayerDataEventByField.set(event.fieldName, event);
				if (isPlayerDataEventOfFieldSilk(event, 'heroState_isPaused')) {
					isPaused = event.value;
				} else if (isPlayerDataEventOfFieldSilk(event, 'heroState_transitioning')) {
					isTransitioning = event.value;
				} else if (firstLiveScenesVisited == null && isPlayerDataEventOfFieldSilk(event, 'scenesVisited')) {
					firstLiveScenesVisited = event.value;
				}
				createFrameEndEvent = createFrameEndEvent || frameEndEventPlayerDataFieldsSetSilk.has(event.fieldName);
			}

			if (!isPaused && previousSceneEvent?.sceneName !== 'Menu_Title') {
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
	// add one last frame end event at the end
	if (previousEvent) {
		eventCreationContext.msIntoGame = msIntoGame;
		eventCreationContext.timestamp = previousEvent.timestamp;
		const frameEndEvent: FrameEndEventSilk = new FrameEndEventSilk(
			getLastPlayerDataEventOfField,
			previousFrameEndEvent,
			eventCreationContext,
		);
		events.push(frameEndEvent);
	}

	if (restorePointEvents.length > 0) {
		events.unshift(...buildRestorePointTimeline(restorePointEvents, firstLiveScenesVisited ?? new Set()));
	}

	(window as any).hkvizEvents = () => events;

	return new CombinedRecordingSilk(
		events,
		recordings.reduce((sum, recording) => sum + recording.unknownEvents, 0),
		recordings.reduce((sum, recording) => sum + recording.parsingErrors, 0),
		[...allHkVizModVersions].sort(),
		combineStorageStats(recordings.map((recording) => recording.storageStats)),
	);
}
