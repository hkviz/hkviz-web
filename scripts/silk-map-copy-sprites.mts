import { copyFile } from 'fs/promises';
import path from 'path';
import type { SpriteInfoGenerated } from '~/lib/game-data/shared/sprite-info-generated.ts';
import { silkMapDataGenerated } from '../src/lib/game-data/silk-data/silk-map.generated.ts';

const silksongAssetsPath = '../hkviz-silk-extract-export-2';
const destBasePath = './assets-build/silk-map{tps}';

let failed = 0;

async function copySprite(sprite: SpriteInfoGenerated | undefined | null) {
	try {
		const name = sprite?.name;
		if (!name) {
			return;
		}
		const src = path.join(silksongAssetsPath, name + '.png');
		const srcAbs = path.resolve(src);
		const dest = path.join(destBasePath, name + '.png');
		const destAbs = path.resolve(dest);
		//console.log(`Copying ${srcAbs} to ${destAbs}`);
		await copyFile(srcAbs, destAbs);
	} catch (error) {
		console.error(`Failed to copy sprite ${sprite?.name}:`, error);
		failed++;
	}
}

for (const room of silkMapDataGenerated.rooms) {
	await copySprite(room.initialSprite);
	await copySprite(room.fullSprite);
	await copySprite(room.rendererSprite);
	if (room.altFullSprites) {
		for (const alt of room.altFullSprites) {
			await copySprite(alt.sprite);
		}
	}
}
console.log(`Finished copying sprites with ${failed} failures.`);
