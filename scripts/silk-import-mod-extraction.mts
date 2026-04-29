/**
 * The Silksong mod is able to extract map data, localizations and more at runtime.
 * This script imports these extractions into the web source code.
 */
import { copyFile, mkdir } from 'fs/promises';
import path from 'path';
import { supportedLanguagesSilk } from '../src/lib/game-data/silk-data/localization/supported-languages-silk.ts';
import { createCsIdDictionaryFile } from './cs-ids-gen.ts';
import { exportFormattedJsFile } from './js-gen-helper.mts';
import { ScriptIdMemory, ScriptMemory } from './memory/script-memory.mts';
import { readModExtraction } from './mod-extraction-read.mts';
import { unityPySpritePath } from './paths.mts';

// Map data:
async function genMapData() {
	const mapExportJsonStr = await readModExtraction('map-export.json');

	await exportFormattedJsFile(
		'./src/lib/game-data/silk-data/map-data-silk.generated.ts',
		`import type { SilkMapDataGenerated } from './map-data-silk.generated.types.ts';
    
    export const silkMapDataGenerated: SilkMapDataGenerated = ${mapExportJsonStr}`,
	);
}

async function genLangData() {
	let someLangDict: any;
	for (const lang of supportedLanguagesSilk) {
		const localizationJsonStr = await readModExtraction(`localization-${lang}.json`);
		someLangDict = JSON.parse(localizationJsonStr);
		await exportFormattedJsFile(
			`./src/lib/game-data/silk-data/localization/localization-${lang}.generated.ts`,
			`export default ${localizationJsonStr};`,
		);
	}

	await exportFormattedJsFile(
		'./src/lib/game-data/silk-data/localization/load-lang-silk.generated.ts',
		`import type { SupportedLanguageSilk } from './supported-languages-silk.ts';
	import { assertNever } from '~/lib/util/other.ts';

	export interface LocalizationDataSilk {
		${Object.keys(someLangDict)
			.map((key) => `["${key}"]: string;`)
			.join('\n')}
	}

	export async function loadLangSilk(lang: SupportedLanguageSilk): Promise<LocalizationDataSilk> {
		switch (lang) {
			${supportedLanguagesSilk
				.map(
					(lang) => `case '${lang}':
						return (await import('./localization-${lang}.generated')).default;`,
				)
				.join('\n')}
			default:
				return assertNever(lang);
		}
	}`,
	);
}

// area backgrounds
async function genAreaBackgrounds() {
	const saveSlotBackgroundsJsonStr = await readModExtraction('save-slot-backgrounds.json');
	const saveSlotBackgrounds = JSON.parse(saveSlotBackgroundsJsonStr);

	await exportFormattedJsFile(
		'./src/lib/game-data/silk-data/save-slot-backgrounds-silk.generated.ts',
		`
    import type { SilkSpriteInfoGenerated } from "./map-data-silk.generated.types.ts";
	import type { MapZoneSilk } from './map-zone-silk.ts';

	export interface AreaBackgroundData {
		nameOverride: string | null;
		act3OverlayOptOut: boolean;
		backgroundImage: SilkSpriteInfoGenerated | null;
		act3BackgroundImage: SilkSpriteInfoGenerated | null;
    }
	
	export const saveSlotBackgroundSilk: {
		areaBackgrounds: Record<MapZoneSilk, AreaBackgroundData>;
		extraAreaBackgrounds: Record<string, AreaBackgroundData>;
		bellhomeBackgrounds: Record<string, SilkSpriteInfoGenerated>;
	} = ${JSON.stringify(saveSlotBackgrounds, null, 2)};`,
	);
}

// generic id item
async function genGenericIdItem({
	itemName,
	sourceData,
	copySprites,
}: {
	itemName: string;
	sourceData?: any;
	copySprites?: (it: any) => [{ name: string }];
}) {
	const [idMemory, dataJsonStr] = await Promise.all([
		ScriptIdMemory.createIdMemory(`${itemName}-silk`),
		sourceData != null
			? Promise.resolve(JSON.stringify({ all: sourceData }))
			: readModExtraction(`${itemName}-export.json`),
	]);
	const items = JSON.parse(dataJsonStr).all;
	const pascalCaseItemName = itemName
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

	async function makeIdFiles() {
		const camelCaseItemName = itemName
			.split('-')
			.map((part, index) => {
				if (index === 0) {
					return part.toLowerCase();
				} else {
					return part.charAt(0).toUpperCase() + part.slice(1);
				}
			})
			.join('');

		await exportFormattedJsFile(
			`./src/lib/game-data/silk-data/${itemName}-silk.generated.ts`,
			`
		export type ${pascalCaseItemName}NameSilk = ${new Set(items.map((it: any) => `'${it.id}'`)).values().toArray().join(' | ')};

		const list = ${JSON.stringify(items, null, 2)};
		export type ${pascalCaseItemName}Silk = typeof list[number];
		export const ${camelCaseItemName}Silk = {
			list,
			byName: Object.fromEntries(list.map((it: any) => [it.id, it])) as Record<${pascalCaseItemName}NameSilk, ${pascalCaseItemName}Silk>,
		};

	export const ${camelCaseItemName}IdToNameSilk: Map<number, ${pascalCaseItemName}NameSilk> = new Map([
	${items
		.map((it: any) => {
			const id = idMemory.getOrCreateId(it.id);
			return `    [${id}, '${it.id}']`;
		})
		.join(',\n')}
]);
export const ${camelCaseItemName}NamesSilk: ${pascalCaseItemName}NameSilk[] = ${camelCaseItemName}IdToNameSilk.values().toArray();
`,
		);
		await idMemory.write();
		await createCsIdDictionaryFile(`SilkSong${pascalCaseItemName}Ids`, idMemory);
	}

	async function copySpriteFiles() {
		if (!copySprites) return;
		const sprites = items.flatMap(copySprites);

		// ensure folder exists
		const destFolder = path.join('./public/silk-sprites', itemName);
		await mkdir(destFolder, { recursive: true });

		await Promise.all(
			sprites.map(async (sprite: any) => {
				try {
					if (sprite?.name == null) {
						return;
					}
					const sourcePath = path.join(unityPySpritePath, `${sprite.name}.png`);
					const destPath = path.join(destFolder, `${sprite.name}.png`);
					await copyFile(sourcePath, destPath);
				} catch (error) {
					console.error(`Error copying sprite file for ${sprite.name}:`, (error as any)?.message);
				}
			}),
		);
	}

	await Promise.all([makeIdFiles(), copySpriteFiles()]);
}

async function genCrests() {
	await genGenericIdItem({
		itemName: 'tool-crest',
		copySprites: (it: any) => [it.crestSprite],
	});
}
async function genTools() {
	await genGenericIdItem({
		itemName: 'tool-item',
		copySprites: (it: any) => [it.toolSprite],
	});
}
async function genCollectables() {
	await genGenericIdItem({
		itemName: 'collectable',
		copySprites: (it: any) => [it.iconInventory],
	});
}
async function genRelics() {
	await genGenericIdItem({
		itemName: 'collectable-relic',
		copySprites: (it: any) => [it.relicTypeInventoryIcon],
	});
}
async function genEnemyJournals() {
	await genGenericIdItem({
		itemName: 'enemy-journal',
		copySprites: (it: any) => [it.iconSprite],
	});
}

async function genQuests() {
	await genGenericIdItem({
		itemName: 'quest',
		copySprites: (it: any) => [it.typeIcons.icon],
	});
}

async function genMaterium() {
	await genGenericIdItem({ itemName: 'materium' });
}
async function genTransitionGates() {
	await genGenericIdItem({ itemName: 'transition-gate' });
}
async function genRespawnPoints() {
	await genGenericIdItem({ itemName: 'respawn-point' });
}

async function genToolLiquids() {
	await genGenericIdItem({ itemName: 'tool-liquid', sourceData: [{ id: 'Flea Brew' }, { id: 'Lifeblood Syringe' }] });
}

async function genExtraToolSlot() {
	await genGenericIdItem({ itemName: 'extra-tool-slot', sourceData: [{ id: 'Defend1' }, { id: 'Explore1' }] });
}
async function genSilksongVersion() {
	await genGenericIdItem({ itemName: 'silksong-version', sourceData: [{ id: '1.0.30000' }] });
}

async function genSceneData() {
	interface SceneDataFieldExtraction {
		sceneName: string;
		id: string;
	}
	interface SceneDataExtraction {
		bool: SceneDataFieldExtraction[];
		int: SceneDataFieldExtraction[];
		geoRock: SceneDataFieldExtraction[];
	}

	const sceneDataJsonStr = await readModExtraction('scene-data-export.json');
	const sceneData = JSON.parse(sceneDataJsonStr) as SceneDataExtraction;

	await genGenericIdItem({ itemName: 'scene-data-bool', sourceData: sceneData.bool });
	await genGenericIdItem({ itemName: 'scene-data-int', sourceData: sceneData.int });
	await genGenericIdItem({ itemName: 'scene-data-geoRock', sourceData: sceneData.geoRock });

	// bool buckets
	interface BoolBucket {
		id: number;
	}
	interface BoolBucketMemory {
		perScene: Record<string, string[][]>;
	}

	const boolBucketMemory = await ScriptMemory.createMemory<BoolBucketMemory>('scene-data-bool-buckets', () => ({
		perScene: {},
	}));

	for (const boolField of sceneData.bool) {
		if (!boolBucketMemory.data.perScene[boolField.sceneName]) {
			boolBucketMemory.data.perScene[boolField.sceneName] = [];
		}
		const buckets = boolBucketMemory.data.perScene[boolField.sceneName];
		const lastExistingBucket = buckets.length > 0 ? buckets[buckets.length - 1] : null;
		let bucketToUse: string[] | null = null;
		if (buckets.some((bucket) => bucket.includes(boolField.id))) {
			continue; // already in bucket
		}

		if (lastExistingBucket == null || lastExistingBucket.length === 8) {
			if (buckets.length < 255) {
				bucketToUse = [];
				buckets.push(bucketToUse);
			} else {
				console.warn(
					`Scene ${boolField.sceneName} bool bucket limit of  255 reached. Cannot fit all bool fields into buckets.`,
				);
			}
		} else {
			bucketToUse = lastExistingBucket;
		}
		if (bucketToUse != null) {
			bucketToUse.push(boolField.id);
		}
	}

	await boolBucketMemory.write();
}

await Promise.all([
	genMapData(),
	genLangData(),
	genAreaBackgrounds(),
	genCrests(),
	genTools(),
	genCollectables(),
	genRelics(),
	genEnemyJournals(),
	genQuests(),
	genMaterium(),
	genTransitionGates(),
	genRespawnPoints(),
	genToolLiquids(),
	genExtraToolSlot(),
	genSilksongVersion(),
	genSceneData(),
]);
