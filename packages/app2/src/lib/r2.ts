import { envPublic } from '~/env-client';

export type R2Key = string & { __brand: 'R2Key' };

export function r2RunPartFileKey(fileId: string): R2Key {
    return `runpart/${fileId}` as R2Key;
}

export function r2VideoFileKey(fileId: string): R2Key {
    return `video/${fileId}` as R2Key;
}

export function r2GetPublicContentUrl(key: R2Key) {
    return `${envPublic.R2_PUBLIC_BUCKET_URL}${key}`;
}
