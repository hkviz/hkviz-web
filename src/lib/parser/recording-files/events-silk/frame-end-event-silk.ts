import { Vector2 } from '~/lib/game-data/shared/vectors';
import {
	CollectableRelicNameSilk,
	collectableRelicSilk,
} from '~/lib/game-data/silk-data/collectable-relic-silk.generated';
import { CollectableNameSilk, collectableSilk } from '~/lib/game-data/silk-data/collectable-silk.generated';
import {
	PlayerDataFieldNameSilk,
	PlayerDataFieldValueSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import {
	CollectableItemsDataSilk,
	CollectableRelicsDataSilk,
} from '~/lib/game-data/silk-data/types/player-data-custom-types-silk';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { FrameEndEventBase } from '../events-shared/frame-end-event-base';
import { PlayerDataEventSilk } from './player-data-event-silk';

export const frameEndEventPlayerDataFieldsSilk = [
	'geo',
	'ShellShards',
	'HeroCorpseMoneyPool',
	'health',
	'healthBlue',
	'maxHealth',
	'silk',
	'HeroCorpseScene',
	'HeroDeathScenePos',
	'HeroDeathSceneSize',
	'heroState_dead',
	'CrawbellCurrency',
	'Collectables',
	'Relics',
] satisfies PlayerDataFieldNameSilk[];

export const frameEndEventPlayerDataFieldsSetSilk = new Set<PlayerDataFieldNameSilk>(frameEndEventPlayerDataFieldsSilk);

type FrameEndEventPlayerDataFieldSilk = (typeof frameEndEventPlayerDataFieldsSilk)[number];

type FrameEndBase = {
	[TField in FrameEndEventPlayerDataFieldSilk]: PlayerDataFieldValueSilk<TField>;
};

export class FrameEndEventSilk extends FrameEndEventBase implements FrameEndBase {
	HeroCorpseMoneyPool: number;
	geo: number;
	ShellShards: number;
	health: number;
	healthBlue: number;
	maxHealth: number;
	silk: number;
	HeroCorpseScene: string;
	HeroDeathScenePos: Vector2;
	HeroDeathSceneSize: Vector2;
	heroState_dead: boolean;
	CrawbellCurrency: number[];
	Collectables: Map<string, CollectableItemsDataSilk>;
	Relics: Map<string, CollectableRelicsDataSilk>;
	// synthetic
	healthTotal: number;
	healthLost: number;
	crawbellCurrencyGeo: number;
	collectableGeo: number;
	collectableShellShards: number;
	relicGeo: number;
	geoTotal: number;
	crawbellCurrencyShellShard: number;
	shellShardTotal: number;

	previousFrameEndEvent: FrameEndEventSilk | null = null;

	public constructor(
		getLastPlayerDataEventOfField: <K extends PlayerDataFieldNameSilk>(field: K) => PlayerDataEventSilk<K> | null,
		previousFrameEndEvent: FrameEndEventSilk | null,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.HeroCorpseMoneyPool = getLastPlayerDataEventOfField('HeroCorpseMoneyPool')?.value ?? 0;
		this.geo = getLastPlayerDataEventOfField('geo')?.value ?? 0;
		this.ShellShards = getLastPlayerDataEventOfField('ShellShards')?.value ?? 0;
		this.health = getLastPlayerDataEventOfField('health')?.value ?? 0;
		this.healthBlue = getLastPlayerDataEventOfField('healthBlue')?.value ?? 0;
		this.maxHealth = getLastPlayerDataEventOfField('maxHealth')?.value ?? 0;
		this.silk = getLastPlayerDataEventOfField('silk')?.value ?? 0;
		this.HeroCorpseScene = getLastPlayerDataEventOfField('HeroCorpseScene')?.value ?? '';
		this.HeroDeathScenePos = getLastPlayerDataEventOfField('HeroDeathScenePos')?.value ?? Vector2.ZERO;
		this.HeroDeathSceneSize = getLastPlayerDataEventOfField('HeroDeathSceneSize')?.value ?? Vector2.ZERO;
		this.heroState_dead = getLastPlayerDataEventOfField('heroState_dead')?.value ?? false;
		this.CrawbellCurrency = getLastPlayerDataEventOfField('CrawbellCurrency')?.value ?? [];
		this.Collectables = getLastPlayerDataEventOfField('Collectables')?.value ?? new Map();
		this.Relics = getLastPlayerDataEventOfField('Relics')?.value ?? new Map();

		this.healthTotal = this.health + this.healthBlue;
		this.healthLost = this.maxHealth - this.health;

		this.crawbellCurrencyGeo = this.CrawbellCurrency[0] ?? 0;
		this.crawbellCurrencyShellShard = this.CrawbellCurrency[1] ?? 0;

		this.collectableGeo = 0;
		this.collectableShellShards = 0;
		this.Collectables.entries().forEach(([name, data]) => {
			const info = collectableSilk.byName[name as CollectableNameSilk];
			if (data.Amount > 0 && info) {
				info.useResponses?.forEach((response) => {
					if (response.useType === 'Rosaries') {
						this.collectableGeo += response.amount * data.Amount;
					} else if (response.useType === 'Shards') {
						this.collectableShellShards += response.amount * data.Amount;
					}
				});
			}
		});

		this.relicGeo = 0;
		this.Relics.entries().forEach(([name, data]) => {
			const info = collectableRelicSilk.byName[name as CollectableRelicNameSilk];
			if (data.IsCollected && !data.IsDeposited) {
				this.relicGeo += info.rewardAmount;
			}
		});

		this.geoTotal =
			this.geo + this.HeroCorpseMoneyPool + this.crawbellCurrencyGeo + this.collectableGeo + this.relicGeo;
		this.shellShardTotal = this.ShellShards + this.crawbellCurrencyShellShard + this.collectableShellShards;
		this.previousFrameEndEvent = previousFrameEndEvent;
	}
}
