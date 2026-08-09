import {
	playerDataFieldsSilk,
	type PlayerDataFieldNameSilk,
} from '~/lib/game-data/silk-data/player-data/player-data-silk.generated';
import type { Split } from '~/lib/splits/splits-shared/split';
import { createRecordingSplitsSilk } from '~/lib/splits/splits-silk/generate-splits-silk';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { raise } from '~/lib/util/other';
import type { RestorePointInfo } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { SceneEvent } from '../events-shared/scene-event';
import { EnemyDamageEventSilk, EnemyStateEventSilk } from '../events-silk/enemy-event-silk';
import { isFrameEndEventSilk } from '../events-silk/frame-end-event-check-silk';
import type { FrameEndEventSilk } from '../events-silk/frame-end-event-silk';
import { PlayerDataEventSilk } from '../events-silk/player-data-event-silk';
import type { RestorePointFinishEventSilk, RestorePointStartEventSilk } from '../events-silk/restore-point-event-silk';
import type { SceneDataEventSilk, SceneDataEventType } from '../events-silk/scene-data-event-silk';
import { CombinedRecordingBase } from '../parser-shared/recording-shared';
import type { StorageStats } from './storage-stats';

export type RecordingEventSilk =
	| SceneEvent
	| PlayerPositionEvent
	| FrameEndEventSilk
	| PlayerDataEventSilk<PlayerDataFieldNameSilk>
	| SceneDataEventSilk<SceneDataEventType>
	| RestorePointStartEventSilk
	| RestorePointFinishEventSilk
	| EnemyStateEventSilk
	| EnemyDamageEventSilk;

export class ParsedRecordingSilk {
	constructor(
		public readonly events: RecordingEventSilk[],
		public readonly unknownEvents: number,
		public readonly parsingErrors: number,
		public readonly combinedPartNumber: number | null,
		public readonly recordingFileVersion: number,
		public readonly hkVizModVersion: string | null,
		public readonly storageStats: StorageStats,
	) {}

	lastEvent() {
		return (
			this.events[this.events.length - 1] ??
			raise(new Error(`Recording file ${this.combinedPartNumber} does not contain any events`))
		);
	}
	firstEvent() {
		return (
			this.events[0] ?? raise(new Error(`Recording file ${this.combinedPartNumber} does not contain any events`))
		);
	}
}

export class CombinedRecordingSilk extends CombinedRecordingBase<'silk'> {
	public readonly sceneEvents: SceneEvent[] = [];
	public readonly frameEndEvents: FrameEndEventSilk[] = [];
	public readonly playerDataEventsPerField: {
		[K in PlayerDataFieldNameSilk]?: PlayerDataEventSilk<K>[];
	} = {};
	public readonly lastPlayerDataEventsByField: {
		[K in PlayerDataFieldNameSilk]?: PlayerDataEventSilk<K>;
	} = {};

	public readonly playerPositionEventsWithTracePosition: PlayerPositionEvent[] = [];

	public readonly enemyStateEvents: EnemyStateEventSilk[] = [];
	public readonly enemyDamageEvents: EnemyDamageEventSilk[] = [];
	// index into enemyStateEvents where each scene's segment begins, in scene order - lets
	// getEnemiesAt() replay only the current scene visit instead of the whole recording
	private readonly enemySceneCheckpoints: { msIntoGame: number; eventIndex: number }[] = [];

	// one entry per msIntoGame range that shares the same event.restorePoint (by number - a block's
	// own snapshot and its trailing bridge scenes share a number, so they collapse into one segment).
	// Small and bounded (a handful of entries per restore point), unlike events itself - lets
	// restorePointAt() answer "what restore point, if any, is this position from" with a single
	// bounded binary search instead of scanning any event list.
	private readonly restorePointSegments: { msIntoGame: number; restorePoint: RestorePointInfo | null }[] = [];

	public readonly splits: Split[];

	constructor(
		events: RecordingEventSilk[],
		unknownEvents: number,
		parsingErrors: number,
		public readonly allHkVizModVersions: string[],
		public readonly storageStats: StorageStats,
	) {
		super('silk', events, unknownEvents, parsingErrors);

		let lastRestorePointNumber: number | null | undefined = undefined; // undefined = no segment yet
		for (const event of events) {
			const restorePointNumber = event.restorePoint?.number ?? null;
			if (restorePointNumber !== lastRestorePointNumber) {
				this.restorePointSegments.push({ msIntoGame: event.msIntoGame, restorePoint: event.restorePoint });
				lastRestorePointNumber = restorePointNumber;
			}

			if (event instanceof SceneEvent) {
				this.sceneEvents.push(event);
				this.enemySceneCheckpoints.push({
					msIntoGame: event.msIntoGame,
					eventIndex: this.enemyStateEvents.length,
				});
			} else if (event instanceof EnemyStateEventSilk) {
				this.enemyStateEvents.push(event);
			} else if (event instanceof EnemyDamageEventSilk) {
				this.enemyDamageEvents.push(event);
			} else if (event instanceof PlayerDataEventSilk) {
				const eventsOfField = (this.playerDataEventsPerField as any)[event.fieldName] ?? [];
				eventsOfField.push(event);
				this.playerDataEventsPerField[event.fieldName] = eventsOfField;
				(this.lastPlayerDataEventsByField as any)[event.fieldName] = event;
			} else if (event instanceof PlayerPositionEvent) {
				if (
					event.mapPosition != null &&
					event.previousPlayerPositionEventWithMapPosition?.mapPosition != null &&
					!event.previousPlayerPositionEventWithMapPosition.mapPosition.equals(event.mapPosition)
				) {
					this.playerPositionEventsWithTracePosition.push(event);
				}
			} else if (isFrameEndEventSilk(event)) {
				this.frameEndEvents.push(event);
			}
		}
		this.splits = createRecordingSplitsSilk(this);
	}

	public getPlayerDataEventsOfField<K extends PlayerDataFieldNameSilk>(field: K): PlayerDataEventSilk<K>[] {
		return this.playerDataEventsPerField[field] ?? [];
	}

	public lastPlayerDataEventOfField<K extends PlayerDataFieldNameSilk>(field: K): PlayerDataEventSilk<K> | null {
		return this.lastPlayerDataEventsByField[field] ?? null;
	}

	// The restore point (if any) that msIntoGame is reconstructed from - null once live recording
	// starts. Single bounded binary search over restorePointSegments, not a scan over events.
	public restorePointAt(msIntoGame: number): RestorePointInfo | null {
		const index = binarySearchLastIndexBefore(this.restorePointSegments, msIntoGame, (it) => it.msIntoGame);
		return this.restorePointSegments[index]?.restorePoint ?? null;
	}

	// All enemies alive at msIntoGame, keyed by id. Binary-searches for the scene visit containing
	// msIntoGame, then replays forward only within that segment - bounded by "enemy events since the
	// current scene started", not the whole recording, since a scene change always clears the board.
	public getEnemiesAt(msIntoGame: number): Map<number, EnemyStateEventSilk> {
		let low = 0;
		let high = this.enemySceneCheckpoints.length - 1;
		let startIndex = 0;
		while (low <= high) {
			const mid = (low + high) >> 1;
			const checkpoint = this.enemySceneCheckpoints[mid]!;
			if (checkpoint.msIntoGame <= msIntoGame) {
				startIndex = checkpoint.eventIndex;
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}

		const result = new Map<number, EnemyStateEventSilk>();
		for (let i = startIndex; i < this.enemyStateEvents.length; i++) {
			const event = this.enemyStateEvents[i]!;
			if (event.msIntoGame > msIntoGame) break;
			if (event.alive) {
				result.set(event.id, event);
			} else {
				result.delete(event.id);
			}
		}
		return result;
	}

	public debugPrintNeverOccurredPlayerDataEvents(): void {
		const inRun = new Set(Object.keys(this.playerDataEventsPerField) as PlayerDataFieldNameSilk[]);
		const all = Object.keys(playerDataFieldsSilk.byFieldName);
		const neverOccurredFields = all.filter((field) => !inRun.has(field as PlayerDataFieldNameSilk));
		console.log('Player data fields that never occurred in this recording:', neverOccurredFields);
	}
}
