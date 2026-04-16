import * as v from 'valibot';
import { mapZoneSchemaHollow } from '~/lib/game-data/hollow-data/map-zone-hollow';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { RunDataV1 } from '../v1-api-models';

export function mapRunToV1(run: RunMetadata): RunDataV1 {
	return {
		...run,
		gameState: {
			...run.gameState,
			mapZone: v.parse(mapZoneSchemaHollow, run.gameState.mapZone),
		},
	};
}
