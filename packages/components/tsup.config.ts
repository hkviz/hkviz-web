// tsup.config.ts
import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';
import { solidPlugin } from 'esbuild-plugin-solid';

const preset_options: preset.PresetOptions = {
    // array or single object
    entries: [
        // default entry (index)
        {
            // entries with '.tsx' extension will have `solid` export condition generated
            entry: 'src/index.ts',
            // set `true` or pass a specific path to generate a development-only entry
            dev_entry: true,
            // set `true` or pass a specific path to generate a server-only entry
            server_entry: true,
        },
        // {
        //     // non-default entries with "index" filename should have a name specified
        //     name: 'additional',
        //     entry: 'src/additional/index.ts',
        //     dev_entry: true,
        // },
        // {
        //     entry: 'src/shared.ts',
        // },
    ],
    // Set to `true` to remove all `console.*` calls and `debugger` statements in prod builds
    drop_console: false,
    // Set to `true` to generate a CommonJS build alongside ESM
    cjs: false,
    //     modify_esbuild_options: (modify_esbuild_options, permutation) => {
    //         permutation.entries.forEach((entry) => {
    //             // modify esbuild options
    //             entry.type.jsx = true;
    //         });
    //         // modify esbuild options
    //         return modify_esbuild_options;
    //     },
};

export default defineConfig((config) => {
    const watching = !!config.watch;

    const parsed_data = preset.parsePresetOptions(preset_options, watching);

    if (!watching) {
        const package_fields = preset.generatePackageExports(parsed_data);

        console.log(`\npackage.json: \n${JSON.stringify(package_fields, null, 2)}\n\n`);

        /*
            will update ./package.json with the correct export fields
        */
        preset.writePackageJson(package_fields);
    }

    const tsupOptions = preset.generateTsupOptions(parsed_data);

    tsupOptions.forEach((build) => {
        const solidPluginIndex = build.esbuildPlugins?.findIndex((plugin) => plugin.name === 'esbuild:solid') ?? -1;
        console.log({ solidPluginIndex });
        console.log(build.esbuildPlugins);
        if (solidPluginIndex !== -1) {
            const isServer = build.platform === 'node';
            const override = solidPlugin({
                solid: {
                    generate: isServer ? 'ssr' : 'dom',
                    hydratable: true,
                },
            });
            build.esbuildPlugins![0] = override;
        }

        return build;
    });

    console.log(Object.fromEntries(tsupOptions.map((b) => [JSON.stringify(b.entry), b.esbuildPlugins])));

    return tsupOptions;
});
