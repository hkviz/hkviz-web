import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

// Load script-local env files. .env.local overrides .env when present.
dotenv.config({ path: path.join(scriptsDir, '.env') });
dotenv.config({ path: path.join(scriptsDir, '.env.local'), override: true });

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(
			`Missing required env var ${name}. Add it to scripts/.env (or scripts/.env.local). See scripts/.env.example.`,
		);
	}
	return value;
}

export const modsRepo = requireEnv('HKVIZ_MODS_REPO');
export const modExportPath = requireEnv('HKVIZ_MOD_EXPORT_PATH');
export const unityPyExportPath = requireEnv('HKVIZ_UNITYPY_EXPORT_PATH');
export const unityPySpritePath = requireEnv('HKVIZ_UNITYPY_SPRITE_PATH');
