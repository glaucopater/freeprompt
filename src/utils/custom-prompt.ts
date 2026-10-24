import { VISION_PROMPTS } from "../../netlify/functions/prompts";

/** Key used to persist the user's custom image-analysis prompt in the browser. */
export const CUSTOM_VISION_PROMPT_KEY = "freeprompt.custom-vision-prompt";

/** Prompt used when the user does not provide a custom one. */
export const DEFAULT_VISION_PROMPT = VISION_PROMPTS[0];

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStorage(): StorageLike | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    // localStorage is unavailable (SSR, disabled storage, private mode)
    return null;
  }
}

/** Returns the persisted custom prompt, or an empty string when none is stored. */
export function readCustomVisionPrompt(store: StorageLike | null = browserStorage()) {
  return store?.getItem(CUSTOM_VISION_PROMPT_KEY)?.trim() ?? "";
}

/** Persists the custom prompt (removing it when empty) and returns the trimmed value. */
export function saveCustomVisionPrompt(prompt: string, store: StorageLike | null = browserStorage()) {
  const trimmed = prompt.trim();
  if (!store) return trimmed;
  if (trimmed) store.setItem(CUSTOM_VISION_PROMPT_KEY, trimmed);
  else store.removeItem(CUSTOM_VISION_PROMPT_KEY);
  return trimmed;
}

export function clearCustomVisionPrompt(store: StorageLike | null = browserStorage()) {
  store?.removeItem(CUSTOM_VISION_PROMPT_KEY);
}

/** Custom prompt wins over the default one; blank or missing input falls back to the default. */
export function resolveVisionPrompt(customPrompt: string | undefined | null) {
  return customPrompt?.trim() || DEFAULT_VISION_PROMPT;
}
