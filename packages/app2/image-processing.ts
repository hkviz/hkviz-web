import { imagetools } from 'vite-imagetools';
import getImageColors from 'get-image-colors';
import fs from 'fs';

function getAverageColor(filePath: string) {
    return new Promise((resolve, reject) => {
        getImageColors(filePath)
            .then((colors) => {
                // Assuming you want the first color as the average color
                const averageColor = colors[0].hex();
                resolve(averageColor);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export function imagetoolsWithAverageColor() {
    const imagetoolsPlugin = imagetools({
        defaultDirectives: (url: URL) => {
            if (url.searchParams.has('spotify')) {
                return new URLSearchParams({
                    tint: 'ffaa22',
                });
            }
            return new URLSearchParams({
                tint: 'ff0000',
            });
        },
    });

    const plugin = {
        ...imagetoolsPlugin,
        name: 'vite-plugin-imagetools-with-color',
        async load(id: string) {
            if (id.includes('src') && /\.(png|jpe?g|gif|webp|tiff|bmp|avif)$/.test(id)) {
                console.log(id);
                const result = await imagetoolsPlugin.load(id);

                if (result) {
                    console.log('Processing image:', id, result);
                    const filePath = id.split('?')[0]; // Strip out the query parameters

                    // Ensure the file exists
                    if (!fs.existsSync(filePath)) {
                        return null;
                    }

                    const averageColor = await getAverageColor(filePath);

                    const metadataExport = result.match(/export const metadata = ({[\s\S]*?});/);
                    if (metadataExport) {
                        const metadataObject = JSON.parse(metadataExport[1]);
                        metadataObject.averageColor = averageColor;

                        const updatedMetadata = `export const metadata = ${JSON.stringify(metadataObject)};`;
                        const updatedResult = result.replace(metadataExport[0], updatedMetadata);

                        return updatedResult;
                    }
                }

                return result;
            }

            return null;
        },
    };
    console.log(plugin);
    return plugin;
}
