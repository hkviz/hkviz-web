import { EnemyJournalSilk } from './enemy-journal-silk.generated';

export function isBossEnemySilk(enemy: EnemyJournalSilk): boolean {
	return enemy.killsRequired === 1;
}
