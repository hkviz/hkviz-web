import { GetObjectCommand, HeadObjectCommand, HeadObjectCommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '~/env.mjs';

export const r2 = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

export type R2Key = string & { __brand: 'R2Key' };

export function r2RunPartFileKey(fileId: string): R2Key {
    return `runpart/${fileId}` as R2Key;
}

export async function r2FileHead(key: R2Key): Promise<HeadObjectCommandOutput | null> {
    return r2
        .send(
            new HeadObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: key,
            }),
        )
        .then(
            (headObject) => {
                return headObject;
            },
            (err) => {
                if (err instanceof Error && err.name === 'NotFound') {
                    return null;
                }
                throw err;
            },
        );
}

export async function r2GetSignedUploadUrl(key: R2Key) {
    return await getSignedUrl(
        r2,
        new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            // ContentLength: 100 * 1024 * 1024,
            Key: key,
        }),
        { expiresIn: 60 },
    );
}

export async function r2GetSignedDownloadUrl(key: R2Key) {
    return await getSignedUrl(
        r2,
        new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
        }),
        { expiresIn: 60 },
    );
}
