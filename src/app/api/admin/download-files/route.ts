import fsOld from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { env } from '~/env.mjs';
import { r2DownloadToFile, r2RunPartFileKey } from '~/lib/r2';
import { assertIsResearcher } from '~/server/api/routers/lib/researcher';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

function fileExists(path: string) {
    return new Promise<boolean>((resolve, reject) => {
        fsOld.stat(path, function (err, stat) {
            if (err == null) {
                resolve(true);
            } else if (err.code === 'ENOENT') {
                resolve(false);
            } else {
                reject(err);
            }
        });
    });
}

export async function GET() {
    const session = await getServerAuthSession();
    if (!session) throw new Error('No session found');
    await assertIsResearcher({ db, userId: session.user.id });

    const files = (
        await db.query.runFiles.findMany({
            columns: {
                id: true,
            },
            where: (runFiles, { eq }) => eq(runFiles.uploadFinished, true),
        })
    ).map((it) => ({
        id: it.id,
        path: path.join(env.FILE_DOWNLOAD_PATH, `/${it.id}.hkpart`),
        r2Key: r2RunPartFileKey(it.id),
    }));

    let downloadedFiles = 0;
    const dateStr = new Date().toISOString().replace(/:/g, '_');
    const errorPath = path.join(env.FILE_DOWNLOAD_PATH, `/_errors_${dateStr}.txt`);
    const logPath = path.join(env.FILE_DOWNLOAD_PATH, `/_log_${dateStr}.txt`);

    const chunkSize = 100;
    for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);

        await Promise.all(
            chunk.map(async (it) => {
                if (!(await fileExists(it.path))) {
                    try {
                        await r2DownloadToFile(it.r2Key, it.path);
                        downloadedFiles++;
                        await fs.appendFile(logPath, ':' + it.id + '\n', 'utf8');
                    } catch (ex: any) {
                        console.error('Error while downloading file', it.id, ex);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        await fs.appendFile(errorPath, '::::' + it.id + ':' + ex?.message + '\n\n', 'utf8');
                    }
                }
            }),
        );
        console.log(`Downloaded ${downloadedFiles} files. ${i}/${files.length} checked`);
    }
    console.log(`Downloaded ${downloadedFiles} files. Checked ${files.length} files in total`);

    return new Response('ok');
}
