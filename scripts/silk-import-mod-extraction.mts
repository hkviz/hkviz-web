/**
 * The Silksong mod is able to extract map data, localizations and more at runtime.
 * This script imports these extractions into the web source code.
 */
import { supportedLanguagesSilk } from '../src/lib/game-data/silk-data/localization/supported-languages-silk.ts';
import { exportFormattedJsFile } from './js-gen-helper.mts';
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

// crests
async function genCrests() {
	const crestsJsonStr = await readModExtraction('tool-crest-export.json');
	const crests = JSON.parse(crestsJsonStr);
	await exportFormattedJsFile(
		'./src/lib/game-data/silk-data/crests-silk.generated.ts',
		`export const crestsSilk = ${crestsJsonStr};
	export type CrestNameSilk = ${crests.crests.map((it: any) => `'${it.id}'`).join(' | ')};
	export const crestNamesSilk: CrestNameSilk[] = [${crests.crests.map((it: any) => `'${it.id}'`).join(', ')}];`,
	);
}

await Promise.all([genMapData(), genLangData(), genAreaBackgrounds(), genCrests()]);
