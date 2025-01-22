import * as v from 'valibot';
import { env } from '~/env.mjs';

export async function apiGet<TResult>(
    url: string,
    schema: v.BaseSchema<any, TResult, any>,
    init?: RequestInit,
): Promise<TResult> {
    const fullUrl = env.API_URL + url;
    const response = await fetch(fullUrl, {
        ...(init ?? {}),
        headers: {
            'x-api-key': env.API_URL_KEY,
            'x-vercel-protection-bypass': env.API_VERCEL_AUTOMATION_BYPASS_SECRET,
            ...(init?.headers ?? {}),
        },
        credentials: 'include',
    });

    const json = await response.json();

    const result = v.safeParse(schema, json);
    if (result.success) {
        return result.output;
    } else {
        throw new Error(`Invalid response: ${JSON.stringify(v.flatten(result.issues))}`);
    }
}

export async function apiPost<TResult, TInput>(
    url: string,
    input: TInput,
    schema: v.BaseSchema<any, TResult, any>,
): Promise<TResult> {
    return await apiGet(url, schema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}
