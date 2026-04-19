/**
 * The Silksong mod is able to extract map data, localizations and more at runtime.
 * This script imports these extractions into the web source code.
 */
import { readFile } from 'fs/promises';
import path from 'path';
import { modExportPath, unityPyExportPath } from './paths.mts';

export async function readModExtraction(fileName: string) {
	const filePath = path.join(modExportPath, fileName);
	return await readFile(filePath, 'utf-8');
}

export async function readUnityPyExtraction(fileName: string) {
	const filePath = path.join(unityPyExportPath, fileName);
	return await readFile(filePath, 'utf-8');
}
