import type { APIEvent } from '@solidjs/start/server';
import { HollowModVersion, typeCheckNever } from '~/lib/parser';
import { GameId } from '~/lib/types/game-ids';

interface ModVersionCheckResponse {
	message: string;
	color: 'red' | 'blue' | 'cyan' | 'white' | 'green';
	show: boolean;
}

function getHollowVersionCheckResult(version: string): ModVersionCheckResponse {
	const versionTyped = version as HollowModVersion;

	const updateForBetterStats = 'Update for better analytics and stability improvements.';

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
				message: `You are using a unknown version of the HKViz mod.`,
				color: 'cyan',
				show: true,
			};
		}
	}
}

function getSilkVersionCheckResult(version: string): ModVersionCheckResponse {
	// TODO proper checks
	return {
		message: 'Silksong mod not supported yet',
		color: 'cyan',
		show: true,
	};
}

export function GET({ params }: APIEvent) {
	const pathSplit = params.version.split('/');
	if (pathSplit.length === 1) {
		// old hollow knight mod version. No game id present.
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
