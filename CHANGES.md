# Branch changes

Branch: `decommission-reve-api`

## 1. Deprecate/remove Reve integration

- Removed `netlify/functions/reve-generate-images.ts`.
- Switched image generation from `reve-generate-images` to `gemini-generate-images`.
- Restored Gemini image models in `src/components/GenerateMediaCard.ts`.
- Removed Reve-specific request/response handling from `src/setup.ts`.
- Renamed the shared function log file from `reve-generate-images.log` to `gemini-generate-images.log`.
- Added `src/components/GenerateMediaCard.test.ts` to verify the generator uses bundled Gemini image models and no Reve references.

## 2. Upgrade dependencies

- Updated Yarn from `4.13.0` to `4.18.1`.
- Updated direct dependencies in `package.json`, including Vite, Vitest, ESLint, TypeScript, Netlify CLI, Netlify functions, Google Generative AI, Sharp, and related type packages.
- Refreshed `yarn.lock` and `deno.lock`.
- Pinned TypeScript to `6.0.3` because `typescript-eslint@8.72.0` does not support TypeScript 7.
- Updated test mocks for Vitest 5 constructor compatibility.
- Fixed an upgraded ESLint `no-useless-assignment` issue in `src/utils/index.ts`.

## 3. Replace masonry background images

- Replaced remote Picsum Photos requests with 20 local WebP images from the user's Unsplash profile (`@glaucopater`).
- Updated `src/components/MasonryBackground.ts` to load bundled images dynamically.
- Updated `src/style.css` for seamless animation spacing.
- Added `src/components/MasonryBackground.test.ts`.
- Added `src/assets/images/background/SOURCES.md` documenting image sources and license.
- Added Netlify and Vite cache headers for `.webp` assets.

## Validation

- `yarn install --immutable`: passed
- Tests: 18 passed
- Production build: passed
- Lint: 0 errors, 11 existing warnings
- Browser smoke test: passed
- Sharp smoke test: passed
