import type { EventCreationContext, RestorePointInfo } from './event-creation-context';

export abstract class RecordingEventBase {
	timestamp: number;
	msIntoGame = 0;
	// non-null only for Silk events reconstructed from a restore point (see parseRecordingFileSilk /
	// combineRecordingsSilk's buildRestorePointTimeline) - always null for Hollow.
	restorePoint: RestorePointInfo | null = null;
	constructor(ctx: EventCreationContext) {
		this.timestamp = ctx.timestamp;
		if (ctx.msIntoGame != null) {
			this.msIntoGame = ctx.msIntoGame;
		}
		this.restorePoint = ctx.restorePoint;
	}
}
