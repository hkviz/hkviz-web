/**
 * The Silksong mod is able to extract map data, localizations and more at runtime.
 * This script imports these extractions into the web source code.
 */
import { splitSuffixSceneNameSilk } from '../src/lib/game-data/silk-data/sub-scene-names-silk.ts';
import { createCsIdDictionaryFile } from './cs-ids-gen.ts';
import { exportFormattedJsFile } from './js-gen-helper.mts';
import { readGenMemory, ScriptIdMemory } from './memory/script-memory.mts';
import { readModExtraction, readUnityPyExtraction } from './mod-extraction-read.mts';

// scene to actual scene

const silkSceneNameToActual: Record<string, string> = {
	Slab_03b: 'Slab_03',
	Cog_07b: 'Cog_07',
	'Library_04 _bot': 'Library_04', // accidental space in game files?
	Arborium_07b: 'Arborium_07',
	Dust_10b: 'Dust_10',
	Enclave_bridge_left: 'Song_Enclave',
	Shellwood_13b: 'Shellwood_13',
};

// a small list of manually maintained not-actual scene names.
// part of the visited scenes, but not part of the map nor actual scenes therefore not found otherwise.
const unfoundSceneNames = [
	'Ant_02b',
	'Bone_East_15_right',
	'Greymoor_02b',
	'Song_05_right',
	'Coral_35_break_base',
	'Coral_35_break_base_bottom',
	'Dock_02_bot',
	'Slab_07_top_left',
	'Slab_07_ascent',
	'Abyss_12_top',
	'Coral_29_left',
	'Coral_29_joiner',
	'Coral_29_right',
];

// Map data:
async function readMapModExtractionSceneNames(): Promise<Set<string>> {
	const mapExportJsonStr = await readModExtraction('map-export.json');
	const mapExport = JSON.parse(mapExportJsonStr);
	const sceneNames = new Set<string>(mapExport.rooms.map((it: any) => it.sceneName));
	unfoundSceneNames.forEach((name) => {
		sceneNames.add(name);
	});
	return sceneNames;
}

// UnityPy data:
async function readUnityPyModExtractionSceneNames(): Promise<Map<string, { zone: number; id: number }>> {
	const unityPyExportJsonStr = await readUnityPyExtraction('scenes.json');
	const unityPyExport = JSON.parse(unityPyExportJsonStr);
	return new Map(Object.entries(unityPyExport));
}

async function readGenMemorySceneIds(): Promise<
	Map<string, { id: number; zone: number | null; actualSceneName: string }>
> {
	const sceneIds = await readGenMemory('scene-ids.json');
	if (!sceneIds) {
		return new Map();
	}
	return new Map(Object.entries(sceneIds));
}

const [mapSceneNames, unityPySceneNames, memorySceneIds] = await Promise.all([
	readMapModExtractionSceneNames(),
	readUnityPyModExtractionSceneNames(),
	ScriptIdMemory.createIdMemory('scene-ids-silk'),
]);

const sceneNameByLower = new Map(mapSceneNames.values().map((it) => [it.toLowerCase(), it]));

const allSceneNamesLower = new Set<string>([
	...mapSceneNames.values().map((it) => it.toLowerCase()),
	...unityPySceneNames.keys().map((it) => it.toLowerCase()),
	...memorySceneIds.idsLower(),
]);

const sceneNameToMeta: Map<string, { id: number; zone: number | null; actualSceneName: string | null }> = new Map<
	string,
	{ id: number; zone: number | null; actualSceneName: string }
>();

let errorCountNotActual = 0;
let errorCountNoUpper = 0;

function sceneNameToActualSceneName(sceneName: string): string | null {
	if (silkSceneNameToActual[sceneName]) {
		return silkSceneNameToActual[sceneName];
	}
	if (unityPySceneNames.has(sceneName.toLowerCase())) {
		return sceneName;
	}

	let attempts = 0;
	let current = sceneName;

	while (attempts < 4) {
		const parts = current.split('_');
		if (parts.length <= 1) break;
		const candidate = parts.slice(0, -1).join('_');
		if (unityPySceneNames.has(candidate.toLowerCase())) {
			return candidate;
		}
		current = candidate;
		attempts++;
	}
	console.warn(`[not-actual] ${sceneName} is not an actual scene name in silk data`);
	errorCountNotActual++;

	return null;
}

for (const sceneNameLower of allSceneNamesLower.values().toArray().sort()) {
	let sceneName = sceneNameByLower.get(sceneNameLower); // try 1 - exact match with map data

	if (!sceneName) {
		// try 2 - suffix
		const [lowerNoSuffix, suffix] = splitSuffixSceneNameSilk(sceneNameLower);
		if (suffix) {
			const sceneNameNoSuffix = sceneNameByLower.get(lowerNoSuffix);
			if (sceneNameNoSuffix) {
				sceneName = sceneNameNoSuffix + suffix;
			}
		}
	}

	if (!sceneName) {
		console.warn(`[no-upper] "${sceneNameLower}" found in UnityPy or memory but not in map mod extraction`);
		errorCountNoUpper++;
		sceneName = sceneNameLower;
	}
	const zone = unityPySceneNames.get(sceneNameLower)?.zone ?? null;
	const id = memorySceneIds.getOrCreateId(sceneName);
	const actualSceneName = sceneNameToActualSceneName(sceneName);

	sceneNameToMeta.set(sceneName, { id, zone, actualSceneName });
}

console.log(`Generated scene IDs for ${sceneNameToMeta.size} scenes, max ID used: ${memorySceneIds.maxId}`);
console.log(`Errors:`);
console.log(`[not-actual] ${errorCountNotActual} not actual scene names`);
console.log(`[no-upper] ${errorCountNoUpper} scene names missing upper case version`);

await Promise.all([
	memorySceneIds.write(),
	exportFormattedJsFile(
		'./src/lib/game-data/silk-data/scene-ids-silk.generated.ts',
		`import { SceneIdDataSilk } from './scene-ids-silk.generated.types';
    
    export const sceneNameToIdGeneratedSilk: Record<string, SceneIdDataSilk> = ${JSON.stringify(Object.fromEntries(sceneNameToMeta.entries()), null, 2)}`,
	),
	createCsIdDictionaryFile('SilkSongScenes', memorySceneIds, 'SCENES'),
]);
