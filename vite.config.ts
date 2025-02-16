/// <reference types="vitest/config" />
import { createHtmlPlugin } from "vite-plugin-html";

import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // vite config
    build: {
      outDir: "dist",
    },
    publicDir: "assets",
    plugins: [
      createHtmlPlugin({
        minify: true,
        /**
         * After writing entry here, you will not need to add script tags in `index.html`, the original tags need to be deleted
         * @default src/main.ts
         */
        entry: "src/main.ts",
        /**
         * If you want to store `index.html` in the specified folder, you can modify it, otherwise no configuration is required
         * @default index.html
         */
        template: "public/index.html",

        /**
         * Data that needs to be injected into the index.html ejs template
         */
        inject: {
          data: {
            title: "index",
            injectScript:
              mode === "production"
                ? `<script src="https://js-de.sentry-cdn.com/a81fdabbed6e0855d3b06a27d7af03de.min.js" crossorigin="anonymous"></script>`
                : "",
          },
          tags: [
            {
              injectTo: "body-prepend",
              tag: "div",
              attrs: {
                id: "tag",
              },
            },
          ],
        },
      }),
    ],
  };
});
