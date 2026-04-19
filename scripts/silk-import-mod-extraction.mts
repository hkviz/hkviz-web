/**
 * The Silksong mod is able to extract map data, localizations and more at runtime.
 * This script imports these extractions into the web source code.
 */
import { supportedLanguagesSilk } from '../src/lib/game-data/silk-data/localization/supported-languages-silk.ts';
import { createCsIdDictionaryFile } from './cs-ids-gen.ts';
import { exportFormattedJsFile } from './js-gen-helper.mts';
import { ScriptIdMemory } from './memory/script-memory.mts';
import { readModExtraction } from './mod-extraction-read.mts';

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
async function genGenericIdItem(itemName: string) {
	const [idMemory, dataJsonStr] = await Promise.all([
		ScriptIdMemory.createIdMemory(`${itemName}-silk`),
		readModExtraction(`${itemName}-export.json`),
	]);
	const items = JSON.parse(dataJsonStr).all;
	const pascalCaseItemName = itemName
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

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
		`export const ${camelCaseItemName}Silk = ${dataJsonStr};
export type ${pascalCaseItemName}NameSilk = ${items.map((it: any) => `'${it.id}'`).join(' | ')};

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

async function genCrests() {
	await genGenericIdItem('tool-crest');
}
async function genTools() {
	await genGenericIdItem('tool-item');
}

await Promise.all([genMapData(), genLangData(), genAreaBackgrounds(), genCrests(), genTools()]);
