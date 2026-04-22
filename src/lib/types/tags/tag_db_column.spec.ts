import { describe, it } from 'vitest';
import { gameIds } from '../game-ids';
import { getTagDBColumn } from './tag_db_column';
import { tags } from './tags';

describe('tag_db_column', () => {
	for (const game of gameIds) {
		it(`should correct mapping for game ${game}`, () => {
			const gameTags = tags.filter((tag) => tag.games.includes(game));

			const tagsByDBColumn = Object.groupBy(gameTags, (tag) => getTagDBColumn(tag.code));

			const columnsWithMultipleTags = Object.entries(tagsByDBColumn).filter(([_, tags]) => tags.length > 1);
			if (columnsWithMultipleTags.length > 0) {
				const errorMessage = columnsWithMultipleTags
					.map(([column, tags]) => {
						const tagCodes = tags.map((tag) => tag.code).join(', ');
						return `DB column "${column}" is mapped to multiple tags: ${tagCodes}`;
					})
					.join('\n');
				throw new Error(errorMessage);
			}
		});
	}
});
