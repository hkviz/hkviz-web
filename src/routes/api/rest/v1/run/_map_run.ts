import * as v from 'valibot';
import { mapZoneSchemaHollow } from '~/lib/game-data/hollow-data/map-zone-hollow';
import { TagCode } from '~/lib/types/tags/tags';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { RunDataV1, tagCodeV1Schema } from '../v1-api-models';

export function mapRunToV1(run: RunMetadata): RunDataV1 {
	return {
		...run,
		tags: run.tags.filter((tag): tag is TagCode & v.InferOutput<typeof tagCodeV1Schema> =>
			tagCodeV1Schema.options.includes(tag as any),
		),
		gameState: {
			...run.gameState,
			mapZone: v.parse(mapZoneSchemaHollow, run.gameState.mapZone),
		},
	};
}
