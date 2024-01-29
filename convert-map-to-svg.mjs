import { exec as noPromiseExec } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { rm } from 'fs/promises';
import { glob } from 'glob';
import { dirname } from 'path';
import { promisify } from 'util';

// Install magick: https://imagemagick.org/script/download.php
// Install potrace: https://potrace.sourceforge.io/#downloading
// install svgo: npm install -g svgo

const exec = promisify(noPromiseExec);

const foldersExistanceEnsured = new Set();
/**
 * @param {string} outputPath
 */
function makeFoldersIfNeeded(outputPath) {
    const folderPath = dirname(outputPath);
    if (foldersExistanceEnsured.has(folderPath)) return;
    console.log('ensure folder', folderPath, 'exists');

    if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
    }
    foldersExistanceEnsured.add(folderPath);
}

await rm('./public/ingame-map-svg', { recursive: true, force: true });
await rm('./public/ingame-map-svg-unopt', { recursive: true, force: true });
await rm('./public/ingame-map-pnm', { recursive: true, force: true });

const files = await glob('./public/ingame-map/**/*.png', {
    absolute: true,
}); //.filter((it) => it.includes('White') || it.includes('Water'));

await Promise.all(
    files.map(async (inputPath) => {
        try {
            const isCornifer = inputPath.includes('Cornifer');
            const tmpPnmPathOutline = inputPath.replace('ingame-map', 'ingame-map-pnm').replace('.png', '_outline.pnm');
            const tmpPnmPathBackground = inputPath.replace('ingame-map', 'ingame-map-pnm').replace('.png', '_bg.pnm');
            const svgPathOutline = inputPath
                .replace('ingame-map', 'ingame-map-svg-unopt')
                .replace('.png', '_outline.svg');
            const svgPathBackground = inputPath
                .replace('ingame-map', 'ingame-map-svg-unopt')
                .replace('.png', '_bg.svg');
            makeFoldersIfNeeded(tmpPnmPathOutline);
            makeFoldersIfNeeded(svgPathOutline);
            await exec(
                `magick -background black "${inputPath}" -alpha Remove -negate -resize 100% "${tmpPnmPathOutline}"`,
            );
            if (!isCornifer) {
                await exec(`magick "${tmpPnmPathOutline}" -level 80%,100% "${tmpPnmPathBackground}"`);
            }
            const traceBaseCommand = `potrace --alphamax 5 --turdsize 4 --opttolerance 0.5 --unit 10`;
            await exec(`${traceBaseCommand} -s "${tmpPnmPathOutline}" -o "${svgPathOutline}"`);
            if (!isCornifer) {
                await exec(`${traceBaseCommand} -s "${tmpPnmPathBackground}" -o "${svgPathBackground}"`);
            }
        } catch (error) {
            console.log('Error while converting file', inputPath);
            console.error(error);
        }
    }),
);

await exec(`svgo --folder=./public/ingame-map-svg-unopt --output=./public/ingame-map-svg`);
