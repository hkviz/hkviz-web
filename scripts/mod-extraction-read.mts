/**
 * The Silksong mod is able to extract map data, localizations and more at runtime.
 * This script imports these extractions into the web source code.
 */
import { readFile, writeFile } from 'fs/promises';
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

export async function readGenMemory(fileName: string) {
	const filePath = path.join('./scripts/memory', fileName);
	try {
		return await readFile(filePath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}

		throw error;
	}
}

export async function writeGenMemory(fileName: string, content: string) {
	const filePath = path.join('./scripts/memory', fileName);
	await writeFile(filePath, content, 'utf-8');
}
