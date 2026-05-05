/**
 * This script expects the contents of a silksong extraction python script to be present in the assetsPath.
 * See other repo.
 */

import { copyFile } from 'fs/promises';
import path from 'path';
import { silkMapDataGenerated } from '../src/lib/game-data/silk-data/map-data-silk.generated.ts';
import { saveSlotBackgroundSilk } from '../src/lib/game-data/silk-data/save-slot-backgrounds-silk.generated.ts';
import type { SilkSpriteInfo } from '../src/lib/game-data/silk-data/map-data-silk.types.ts';
import type { SilkSpriteInfoGenerated } from './types/map-data-mod-output-types.ts';

const silksongAssetsPath = '../silk-export/hkviz-silk-extract-export-2';
const destMap = './assets-build/silk-map{tps}';
const destSaveSlotBackgrounds = './public/silk-sprites/save-slot-backgrounds';

let failed = 0;

async function copySprite(sprite: SilkSpriteInfo | SilkSpriteInfoGenerated | undefined | null, destBase: string) {
	try {
		const name = sprite?.name;
		if (!name) {
			return;
		}
		const src = path.join(silksongAssetsPath, name + '.png');
		const srcAbs = path.resolve(src);
		const dest = path.join(destBase, name + '.png');
		const destAbs = path.resolve(dest);
		//console.log(`Copying ${srcAbs} to ${destAbs}`);
		await copyFile(srcAbs, destAbs);
	} catch (error) {
		console.error(`Failed to copy sprite ${sprite?.name}:`, error);
		failed++;
	}
}

for (const room of silkMapDataGenerated.rooms) {
	for (const sprite of room.allSprites) {
		await copySprite(sprite.sprite, destMap);
	}
}
for (const saveSlotBackground of Object.values(saveSlotBackgroundSilk.areaBackgrounds)) {
	await copySprite(saveSlotBackground.backgroundImage, destSaveSlotBackgrounds);
	await copySprite(saveSlotBackground.act3BackgroundImage, destSaveSlotBackgrounds);
}
for (const saveSlotBackground of Object.values(saveSlotBackgroundSilk.extraAreaBackgrounds)) {
	await copySprite(saveSlotBackground.backgroundImage, destSaveSlotBackgrounds);
	await copySprite(saveSlotBackground.act3BackgroundImage, destSaveSlotBackgrounds);
}
for (const saveSlotBackground of Object.values(saveSlotBackgroundSilk.bellhomeBackgrounds)) {
	await copySprite(saveSlotBackground, destSaveSlotBackgrounds);
}
console.log(`Finished copying sprites with ${failed} failures.`);
