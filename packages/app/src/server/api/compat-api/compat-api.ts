import * as v from 'valibot';
import { env } from '~/env.mjs';

export async function apiGet<TResult>(
    url: string,
    schema: v.BaseSchema<TResult, TResult, any>,
    init?: RequestInit,
): Promise<TResult> {
    const fullUrl = env.API_URL + url + env.API_URL_SUFFIX;
    console.log({ fullUrl });
    const response = await fetch(fullUrl, {
        ...(init ?? {}),
        headers: {
            'x-api-key': env.API_URL_KEY,
            ...(init?.headers ?? {}),
        },
    });
    const json = await response.json();

    console.log({ json });

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
    schema: v.BaseSchema<TResult, TResult, any>,
): Promise<TResult> {
    return await apiGet(url, schema, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}
