import * as v from 'valibot';
import { getIngameAuthFlowState, getIngameAuthRedirect } from './ingameauth-flow-state';

const ingameAuthGetForAuthUrlInputSchema = v.object({
	urlId: v.union([v.pipe(v.string(), v.uuid()), v.literal('continue')]),
});
type IngameAuthGetForAuthUrlInput = v.InferInput<typeof ingameAuthGetForAuthUrlInputSchema>;

export async function ingameAuthGetByUrlId(unsafeInput: IngameAuthGetForAuthUrlInput) {
	'use server';
	const input = v.parse(ingameAuthGetForAuthUrlInputSchema, unsafeInput);
	const flowState = await getIngameAuthFlowState(input.urlId);
	return await getIngameAuthRedirect(flowState);
}
