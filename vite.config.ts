/// <reference types="vitest/config" />
import { createHtmlPlugin } from "vite-plugin-html";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // vite config
    server: {
      host: "127.0.0.1", // Add this line for main HTTP server      
      port: Number(env.VITE_PORT) || 5173,
      open: "/", // Ensures clean open
    },
    build: {
      outDir: "dist",
      // Use content hashing for cache busting (Vite default behavior)
      // This ensures browsers fetch new versions when code changes
      rollupOptions: {
        output: {
          // Include content hash in filenames for proper cache invalidation
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || "";
            // Keep manifest.json without hash (referenced by name in HTML)
            if (name.endsWith(".json")) {
              return "assets/[name][extname]";
            }
            // Add hash to all other assets for cache busting
            return "assets/[name]-[hash][extname]";
          },
        },
      },
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
        template: "index.html",

        /**
         * Data that needs to be injected into the index.html ejs template
         */
        inject: {
          data: {
            title: "FreePrompt - AI Media Classifier",
            injectScript:
              mode === "production" && env.VITE_ENABLE_SENTRY !== "false"
                ? `<script src="https://js-de.sentry-cdn.com/a81fdabbed6e0855d3b06a27d7af03de.min.js" crossorigin="anonymous" onerror="console.warn('Sentry script failed to load')"></script>`
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
      // Plugin to inject cache version into service worker, add version query to HTML, and create _headers file
      {
        name: "inject-cache-version",
        writeBundle() {
          // Get version from Netlify COMMIT_REF, package.json version, or timestamp
          const cacheVersion = 
            env.COMMIT_REF?.substring(0, 7) || // Netlify commit ref (first 7 chars)
            env.CONTEXT === "production" ? env.COMMIT_REF?.substring(0, 7) : 
            process.env.npm_package_version || 
            Date.now().toString(36); // Fallback to timestamp-based version
          
          // Update service worker cache version
          const swPath = join(process.cwd(), "dist", "service-worker.js");
          try {
            let swContent = readFileSync(swPath, "utf-8");
            // Replace the cache version placeholder
            swContent = swContent.replace(
              /const CACHE_VERSION = ['"](.*?)['"];?/,
              `const CACHE_VERSION = '${cacheVersion}';`
            );
            writeFileSync(swPath, swContent, "utf-8");
          } catch (error) {
            console.warn("Failed to inject cache version into service worker:", error);
          }

          // Note: We use fixed filenames (no content hashing)
          // Cache busting is handled by:
          // 1. Service worker network-first strategy for HTML
          // 2. Proper cache headers to prevent HTML caching
          // 3. Cache versioning in service worker

          // Create _headers file in dist (Netlify uses this for headers)
          // This is more reliable than netlify.toml headers for some cases
          const headersPath = join(process.cwd(), "dist", "_headers");
          const headersContent = `/index.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/service-worker.js
  Content-Type: application/javascript
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/assets/*.js
  Content-Type: application/javascript
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Content-Type: text/css
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000, immutable

/assets/*.json
  Content-Type: application/json
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000, immutable

/assets/*.png
  Cache-Control: public, max-age=31536000, immutable
`;
          try {
            writeFileSync(headersPath, headersContent, "utf-8");
          } catch (error) {
            console.warn("Failed to create _headers file:", error);
          }
        },
      },
    ],
  };
});
