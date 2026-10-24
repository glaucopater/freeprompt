import { describe, expect, it } from "vitest";
import { IMAGE_GENERATION_MODELS } from "../../netlify/functions/models";
import { GenerateMediaCard } from "./GenerateMediaCard";

describe("GenerateMediaCard", () => {
  it("offers Gemini image generation instead of Reve", () => {
    const card = GenerateMediaCard();

    expect(card).not.toMatch(/reve/i);
    expect(card).toContain('<option value="image" selected>Image</option>');
    IMAGE_GENERATION_MODELS.slice(0, 2).forEach((model) => {
      expect(card).toContain(`value="${model}"`);
    });
  });
});
