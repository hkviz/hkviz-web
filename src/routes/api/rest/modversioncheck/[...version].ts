import type { APIEvent } from '@solidjs/start/server';
import { ModVersionHollow, typeCheckNever } from '~/lib/parser';
import { ModVersionSilk } from '~/lib/parser/recording-files/parser-silk/mod-version-silk';
import { GameId } from '~/lib/types/game-ids';

interface ModVersionCheckResponse {
	message: string;
	color: 'red' | 'blue' | 'cyan' | 'white' | 'green';
	show: boolean;
}

const updateForBetterStats = 'Update for better analytics and bug fixes.';
function getHollowVersionCheckResult(version: string): ModVersionCheckResponse {
	const versionTyped = version as ModVersionHollow;

	switch (versionTyped) {
		case '1.6.1.0':
		case '1.6.0.0':
		case '1.5.1.0':
		case '1.5.0.0':
			return {
				message: '',
				color: 'cyan',
				show: false,
			};
		case '1.4.0.0':
		case '1.3.0.0':
			return {
				message: `A newer version of HKViz has been released. ${updateForBetterStats}`,
				color: 'cyan',
				show: true,
			};
		case '1.2.0.0':
		case '1.1.0.0':
		case '1.0.0.0':
		case '0.0.0.0':
			return {
				message: `You are using a very old version of HKViz. ${updateForBetterStats}`,
				color: 'red',
				show: true,
			};
		default: {
			typeCheckNever(versionTyped);
			return {
				message: `You are using an unknown version of the HKViz mod.`,
				color: 'cyan',
				show: true,
			};
		}
	}
}

function getSilkVersionCheckResult(version: string): ModVersionCheckResponse {
	const versionTyped = version as ModVersionSilk;

	switch (versionTyped) {
		case '0.1.0':
			return {
				message: 'You are using a pre-release version of the HKViz Silksong mod.',
				color: 'cyan',
				show: true,
			};
		default:
			return {
				message: `You are using an unknown version of the HKViz Silksong mod.`,
				color: 'cyan',
				show: true,
			};
	}
}

export function GET({ params }: APIEvent) {
	const pathSplit = params.version.split('/');
	if (pathSplit.length === 1) {
		// Old Hollow Knight mod version; no game ID present.
		return Response.json(getHollowVersionCheckResult(params.version));
	} else if (pathSplit.length === 2) {
		const gameId = pathSplit[0] as GameId;
		const version = pathSplit[1];
		if (gameId === 'hollow') {
			return Response.json(getHollowVersionCheckResult(version));
		} else if (gameId === 'silk') {
			// TODO proper checks
			return Response.json(getSilkVersionCheckResult(version));
		} else {
			typeCheckNever(gameId);
			return Response.json({ message: 'Unsupported game', color: 'cyan', show: true });
		}
	} else {
		return Response.json({ message: 'Invalid mod version format', color: 'cyan', show: true });
	}
}
