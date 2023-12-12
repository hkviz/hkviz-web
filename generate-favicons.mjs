import favicons from 'favicons';
import fs from 'fs/promises';
import path from 'path';

const src = './logo/logo.png'; // Icon source file path.
const dest = './public/favicons'; // Output directory path.
const htmlBasename = 'index.html'; // HTML file basename.

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
const response = await favicons(src, configuration);
await fs.mkdir(dest, { recursive: true });
await Promise.all(
    response.images.map(async (image) => await fs.writeFile(path.join(dest, image.name), image.contents)),
);
await Promise.all(response.files.map(async (file) => await fs.writeFile(path.join(dest, file.name), file.contents)));
await fs.writeFile(path.join(dest, htmlBasename), response.html.join('\n'));

await fs.rm('./public/favicon.ico');
await fs.rename(path.join(dest, 'favicon.ico'), './public/favicon.ico');
