import type { Vector2 } from '~/lib/game-data/shared/vector2';
import type { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';

// One enemy's full resolved state as of this moment - always all four fields, even if only one of
// them actually changed on the wire (the parser fills in the rest from its running per-enemy state).
// alive: false covers both a real EnemyDestroy and a forced scene-change clear; either way
// id/journalName/scene/hp/position still reflect the last known values.
// previousEnemyStateEventOfId chains directly to this same enemy's prior state, built by the parser
// itself (not the combiner) - safe because an enemy's id never survives a scene change, and a scene
// visit never spans two recording files (file rotation only ever happens right after a scene change).
export class EnemyStateEventSilk extends RecordingEventBase {
	constructor(
		public readonly id: number,
		public readonly journalName: string,
		public readonly scene: string,
		public readonly hp: number,
		public readonly position: Vector2 | null,
		public readonly alive: boolean,
		public readonly previousEnemyStateEventOfId: EnemyStateEventSilk | null,
		ctx: EventCreationContext,
	) {
		super(ctx);
	}
}

// See RunFiles.WriteEnemyTakeDamage in the mod for the reasoning behind which HitInstance fields
// are kept vs. dropped.
export interface EnemyHitInstanceSilk {
	attackType: number;
	representingTool: string | null;
	specialType: number;
	silkGeneration: number;
	damageDealt: number;
	damageScalingLevel: number;
	stunDamage: number;
	magnitudeMultiplier: number;
	multiplier: number;
	direction: number;
	isFirstHit: boolean;
	isHeroDamage: boolean;
	ignoreInvulnerable: boolean;
	ignoreNailPosition: boolean;
	isManualTrigger: boolean;
	canWeakHit: boolean;
	forceNotWeakHit: boolean;
	nonLethal: boolean;
	rageHit: boolean;
	criticalHit: boolean;
	hunterCombo: boolean;
}

export class EnemyDamageEventSilk extends RecordingEventBase {
	constructor(
		public readonly enemyId: number,
		public readonly hit: EnemyHitInstanceSilk,
		ctx: EventCreationContext,
	) {
		super(ctx);
	}
}
