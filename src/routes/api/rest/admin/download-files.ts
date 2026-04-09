import path from 'path';
import { env } from '~/env';
import { getUserOrThrow } from '~/lib/auth/shared';
import { r2RunPartFileKey } from '~/lib/r2';
import { db } from '~/server/db';
import { r2Download } from '~/server/r2';
import { assertIsResearcher } from '~/server/researcher';

export async function GET() {
	if (import.meta.env.DEV) {
		const fsOld = await import('fs');
		const fs = await import('fs/promises');

		function fileExists(path: string) {
			return new Promise<boolean>((resolve, reject) => {
				fsOld.stat(path, function (err, _stat) {
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

		const user = await getUserOrThrow();
		await assertIsResearcher({ db, userId: user.id });

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
							const fileStream = await r2Download(it.r2Key);
							await fs.writeFile(it.path, fileStream);
							downloadedFiles++;
							await fs.appendFile(logPath, ':' + it.id + '\n', 'utf8');
						} catch (ex: any) {
							console.error('Error while downloading file', it.id, ex);

							await fs.appendFile(errorPath, '::::' + it.id + ':' + ex?.message + '\n\n', 'utf8');
						}
					}
				}),
			);
			console.log(`Downloaded ${downloadedFiles} files. ${i}/${files.length} checked`);
		}
		console.log(`Downloaded ${downloadedFiles} files. Checked ${files.length} files in total`);

		return new Response('ok');
	} else {
		return new Response('Not allowed', { status: 403 });
	}
}
