// vite.config.mts
import { AssetPack, AssetPackConfig } from '@assetpack/core';
import { compress, CompressOptions } from '@assetpack/core/image';
import { json } from '@assetpack/core/json';
import { texturePacker, texturePackerCompress } from '@assetpack/core/texture-packer';
import { type Plugin, type ResolvedConfig } from 'vite';

const compressionOptions: CompressOptions = {
	jpg: false,
	png: { quality: 80 },
	webp: { quality: 80, alphaQuality: 80 },
	avif: false,
	bc7: false,
	astc: false,
	basis: false,
};

export function assetpackPlugin(): Plugin {
	const apConfig: AssetPackConfig = {
		entry: './assets-build',
		cache: true,
		output: './public/assets',
		pipes: [
			texturePacker({
				texturePacker: {
					padding: 2,
					nameStyle: 'relative',
					removeFileExtension: true,
					allowTrim: false,
					allowRotation: false,
				},
				// resolutionOptions: {
				// 	template: '@%%x',
				// 	resolutions: { default: 1, low: 0.5 },
				// 	fixedResolution: 'default',
				// 	maximumTextureSize: 4096,
				// },
				resolutionOptions: {
					template: '@%%x',
					resolutions: { default: 1 },
					fixedResolution: 'default',
					maximumTextureSize: 4096,
				},
			}),
			compress(compressionOptions),
			texturePackerCompress(compressionOptions),
			json(),
		],
		assetSettings: [
			{
				files: ['**/*.png'],
				settings: {
					compress: {
						jpg: false,
						png: true,
						webp: true,
						avif: false,
					},
				},
			},
		],
	};
	let mode: ResolvedConfig['command'];
	let ap: AssetPack | undefined;

	return {
		name: 'vite-plugin-assetpack',
		configResolved(resolvedConfig) {
			mode = resolvedConfig.command;
		},
		buildStart: async () => {
			if (mode === 'serve') {
				if (ap) return;
				ap = new AssetPack(apConfig);
				void ap.watch();
			} else {
				await new AssetPack(apConfig).run();
			}
		},
		buildEnd: async () => {
			if (ap) {
				await ap.stop();
				ap = undefined;
			}
		},
	};
}
