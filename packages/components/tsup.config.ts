// tsup.config.ts
import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';

const preset_options: preset.PresetOptions = {
    // array or single object
    entries: [
        // default entry (index)
        {
            // entries with '.tsx' extension will have `solid` export condition generated
            entry: 'src/index.ts',
            // set `true` or pass a specific path to generate a development-only entry
            dev_entry: false,
            // set `true` or pass a specific path to generate a server-only entry
            server_entry: false,
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
    drop_console: true,
    // Set to `true` to generate a CommonJS build alongside ESM
    cjs: true,
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

    return preset.generateTsupOptions(parsed_data).map((build) => {
        build.sourcemap = true;
        return build;
    });
});
