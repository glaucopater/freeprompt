/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_DEBUG: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
