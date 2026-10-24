import { describe, expect, it } from "vitest";
import { BACKGROUND_IMAGES } from "./MasonryBackground";

describe("MasonryBackground", () => {
  it("uses a unique set of bundled images instead of remote placeholders", () => {
    expect(BACKGROUND_IMAGES).toHaveLength(20);
    expect(new Set(BACKGROUND_IMAGES).size).toBe(BACKGROUND_IMAGES.length);
    expect(
      BACKGROUND_IMAGES.every(
        (image) => image.endsWith(".webp") && !image.startsWith("http")
      )
    ).toBe(true);
  });
});
