// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import pkg from "@vinxi/plugin-mdx";
var { default: mdx } = pkg;
var app_config_default = defineConfig({
  extensions: ["tsx", "mdx"],
  vite: {
    plugins: [
      mdx.withImports({})({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx"
      })
    ]
  }
});
export {
  app_config_default as default
};
