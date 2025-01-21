import * as v from 'valibot';
import { apiPost } from '../../compat-api/compat-api';
import { type RunDataV1, type RunFilterV1, runDataV1Schema } from '../../compat-api/v1-api-models';

export interface FindRunsOptions {
    filter: RunFilterV1;
}

export type RunFilter = RunFilterV1;

export async function findRuns({ filter }: FindRunsOptions) {
    return await apiPost<RunDataV1[], RunFilterV1>('run', filter, v.array(runDataV1Schema));
}

export type RunMetadata = Awaited<ReturnType<typeof findRuns>>[number];
