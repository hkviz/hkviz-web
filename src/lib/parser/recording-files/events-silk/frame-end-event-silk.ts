import { Vector2 } from '~/lib/game-data/shared/vectors';
import {
	PlayerDataFieldNameSilk,
	PlayerDataFieldValueSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { PlayerDataEventSilk } from './player-data-event-silk';

export const frameEndEventPlayerDataFieldsSilk = [
	'geo',
	'HeroCorpseMoneyPool',
	'health',
	'healthBlue',
	'maxHealth',
	'silk',
	'HeroCorpseScene',
	'HeroDeathScenePos',
	'HeroDeathSceneSize',
	'heroState_dead',
] satisfies PlayerDataFieldNameSilk[];

export const frameEndEventPlayerDataFieldsSetSilk = new Set<PlayerDataFieldNameSilk>(frameEndEventPlayerDataFieldsSilk);

type FrameEndEventPlayerDataFieldSilk = (typeof frameEndEventPlayerDataFieldsSilk)[number];

type FrameEndBase = {
	[TField in FrameEndEventPlayerDataFieldSilk]: PlayerDataFieldValueSilk<TField>;
};

export class FrameEndEventSilk extends RecordingEventBase implements FrameEndBase {
	HeroCorpseMoneyPool: number;
	geo: number;
	health: number;
	healthBlue: number;
	maxHealth: number;
	silk: number;
	HeroCorpseScene: string;
	HeroDeathScenePos: Vector2;
	HeroDeathSceneSize: Vector2;
	heroState_dead: boolean;

	// synthetic
	healthTotal: number;
	geoTotal: number;

	previousFrameEndEvent: FrameEndEventSilk | null = null;

	public constructor(
		getLastPlayerDataEventOfField: <K extends PlayerDataFieldNameSilk>(field: K) => PlayerDataEventSilk<K> | null,
		previousFrameEndEvent: FrameEndEventSilk | null,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.HeroCorpseMoneyPool = getLastPlayerDataEventOfField('HeroCorpseMoneyPool')?.value ?? 0;
		this.geo = getLastPlayerDataEventOfField('geo')?.value ?? 0;
		this.health = getLastPlayerDataEventOfField('health')?.value ?? 0;
		this.healthBlue = getLastPlayerDataEventOfField('healthBlue')?.value ?? 0;
		this.maxHealth = getLastPlayerDataEventOfField('maxHealth')?.value ?? 0;
		this.silk = getLastPlayerDataEventOfField('silk')?.value ?? 0;
		this.HeroCorpseScene = getLastPlayerDataEventOfField('HeroCorpseScene')?.value ?? '';
		this.HeroDeathScenePos = getLastPlayerDataEventOfField('HeroDeathScenePos')?.value ?? Vector2.ZERO;
		this.HeroDeathSceneSize = getLastPlayerDataEventOfField('HeroDeathSceneSize')?.value ?? Vector2.ZERO;
		this.heroState_dead = getLastPlayerDataEventOfField('heroState_dead')?.value ?? false;

		this.healthTotal = this.health + this.healthBlue;
		this.geoTotal = this.geo + this.HeroCorpseMoneyPool;

		this.previousFrameEndEvent = previousFrameEndEvent;
	}
}
