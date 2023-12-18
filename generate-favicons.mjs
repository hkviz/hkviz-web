import favicons from 'favicons';
import fs from 'fs/promises';
import path from 'path';

const src = './logo/logo.svg';
const dest = './public/favicons';
const htmlBasename = 'index.html';

/** @type {import('favicons').FaviconOptions} */
const configuration = {
    path: '/favicons',
    appName: 'HKViz',
    appShortName: 'HKViz',
    appDescription: 'Visual analytics for HollowKnight',
    background: '#06111d',
    theme_color: '#030712',
};

// Below is the processing.
const response = await favicons([src], configuration);
await fs.mkdir(dest, { recursive: true });
await Promise.all(
    response.images.map(async (image) => await fs.writeFile(path.join(dest, image.name), image.contents)),
);
await Promise.all(response.files.map(async (file) => await fs.writeFile(path.join(dest, file.name), file.contents)));
await fs.writeFile(path.join(dest, htmlBasename), response.html.join('\n'));

await fs.rm('./public/favicon.ico');
await fs.rename(path.join(dest, 'favicon.ico'), './public/favicon.ico');

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const manifest = JSON.parse(await fs.readFile('./public/favicons/manifest.webmanifest', 'utf-8'));
await fs.writeFile(
    './public/manifest.json',
    JSON.stringify(
        {
            ...manifest,
            display_override: ['window-controls-overlay', 'minimal-ui'],
        },
        null,
        4,
    ),
);
await fs.rm('./public/favicons/manifest.webmanifest');
const indexHtml = await fs.readFile('./public/favicons/index.html', 'utf-8');
await fs.writeFile(
    './public/favicons/index.html',
    indexHtml
        .replace('/favicons/manifest.webmanifest', '/manifest.json')
        .replace('/favicons/favicon.ico', '/favicon.ico'),
);
