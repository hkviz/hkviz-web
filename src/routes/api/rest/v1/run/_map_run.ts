import * as v from 'valibot';
import { hollowMapZoneSchema } from '~/lib/game-data/hollow-data/hollow-map-zone';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { RunDataV1 } from '../v1-api-models';

export function mapRunToV1(run: RunMetadata): RunDataV1 {
	return {
		...run,
		gameState: {
			...run.gameState,
			mapZone: v.parse(hollowMapZoneSchema, run.gameState.mapZone),
		},
	};
}
