import { describe, expect, it } from "vitest";
import { VISION_PROMPTS } from "../../netlify/functions/prompts";
import {
  CUSTOM_VISION_PROMPT_KEY,
  DEFAULT_VISION_PROMPT,
  clearCustomVisionPrompt,
  readCustomVisionPrompt,
  resolveVisionPrompt,
  saveCustomVisionPrompt,
  type StorageLike,
} from "./custom-prompt";

function createFakeStorage(initial: Record<string, string> = {}): StorageLike {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
}

describe("custom vision prompt", () => {
  it("uses the bundled prompt as the default", () => {
    expect(DEFAULT_VISION_PROMPT).toBe(VISION_PROMPTS[0]);
  });

  it("reads a persisted prompt and trims it", () => {
    const store = createFakeStorage({ [CUSTOM_VISION_PROMPT_KEY]: "  colors only  " });
    expect(readCustomVisionPrompt(store)).toBe("colors only");
  });

  it("returns an empty string when nothing is persisted", () => {
    expect(readCustomVisionPrompt(createFakeStorage())).toBe("");
  });

  it("persists a non-empty prompt", () => {
    const store = createFakeStorage();
    const saved = saveCustomVisionPrompt("  focus on textures  ", store);
    expect(saved).toBe("focus on textures");
    expect(store.getItem(CUSTOM_VISION_PROMPT_KEY)).toBe("focus on textures");
  });

  it("removes the stored prompt when the field is blank", () => {
    const store = createFakeStorage({ [CUSTOM_VISION_PROMPT_KEY]: "focus on textures" });
    expect(saveCustomVisionPrompt("   ", store)).toBe("");
    expect(store.getItem(CUSTOM_VISION_PROMPT_KEY)).toBeNull();
  });

  it("clears the stored prompt", () => {
    const store = createFakeStorage({ [CUSTOM_VISION_PROMPT_KEY]: "focus on textures" });
    clearCustomVisionPrompt(store);
    expect(readCustomVisionPrompt(store)).toBe("");
  });

  it("lets a custom prompt override the default one", () => {
    expect(resolveVisionPrompt("colors only")).toBe("colors only");
    expect(resolveVisionPrompt("   ")).toBe(DEFAULT_VISION_PROMPT);
    expect(resolveVisionPrompt(undefined)).toBe(DEFAULT_VISION_PROMPT);
    expect(resolveVisionPrompt(null)).toBe(DEFAULT_VISION_PROMPT);
  });

  it("does not throw when storage is unavailable", () => {
    expect(readCustomVisionPrompt(null)).toBe("");
    expect(saveCustomVisionPrompt("colors only", null)).toBe("colors only");
    expect(() => clearCustomVisionPrompt(null)).not.toThrow();
  });
});
