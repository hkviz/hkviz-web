import type { APIEvent } from '@solidjs/start/server';
import { typeCheckNever, ModVersion } from '~/lib/parser';

interface ModVersionCheckResponse {
	message: string;
	color: 'red' | 'blue' | 'cyan' | 'white' | 'green';
	show: boolean;
}

function getVersionCheckResult(version: string): ModVersionCheckResponse {
	const versionTyped = version as ModVersion;
	// const toUpdate = 'To update, close Hollow Knight and open a mod manager like Lumafly or Scarab.';

	const updateForBetterStats = 'Update to get better statistics and bug fixes.';

	// console.log(version);
	switch (versionTyped) {
		case '1.6.0.0':
		case '1.5.1.0':
		case '1.5.0.0':
			return {
				message: '',
				color: 'cyan',
				show: false,
			};
		case '1.3.0.0':
		case '1.4.0.0':
			return {
				message: `A newer version of HKViz has been released. ${updateForBetterStats}`,
				color: 'cyan',
				show: true,
			};

		case '0.0.0.0':
		case '1.0.0.0':
		case '1.1.0.0':
		case '1.2.0.0':
			return {
				message: `You are using a very old version of HKViz. ${updateForBetterStats}`,
				color: 'red',
				show: true,
			};
		default: {
			typeCheckNever(versionTyped);
			return {
				message: `You are using a unknown version of HKViz. ${updateForBetterStats}`,
				color: 'cyan',
				show: true,
			};
		}
	}
}

export function GET({ params }: APIEvent) {
	return Response.json(getVersionCheckResult(params.version));
}
