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
      // Use deterministic hashing for easier testing (optional)
      // In production, content-based hashing is better for cache busting
      rollupOptions: {
        output: {
          // You can customize asset file names here if needed
          // But content-based hashing is recommended for production
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
      // Plugin to inject cache version into service worker and add version query to HTML
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

          // Add version query string to HTML to force cache refresh
          // This ensures browsers always fetch fresh HTML even if cached
          const indexPath = join(process.cwd(), "dist", "index.html");
          try {
            let htmlContent = readFileSync(indexPath, "utf-8");
            // Add version query to script and link tags that reference assets
            // This forces browsers to bypass cache for HTML even if service worker caches it
            htmlContent = htmlContent.replace(
              /(src|href)=(["'])(\/assets\/[^"']+)(\2)/g,
              `$1=$2$3?v=${cacheVersion}$2`
            );
            writeFileSync(indexPath, htmlContent, "utf-8");
          } catch (error) {
            console.warn("Failed to inject version query into HTML:", error);
          }
        },
      },
    ],
  };
});
