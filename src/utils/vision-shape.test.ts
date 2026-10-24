import { describe, expect, it } from "vitest";
import { isCategoryLine, isExpectedVisionShape, isPaletteLine } from "./vision-shape";

describe("vision response shape", () => {
  it("accepts comma-separated category words", () => {
    expect(isCategoryLine("Illustration, Mascot, Icon")).toBe(true);
  });

  it("rejects a category line that contains colors", () => {
    expect(isCategoryLine("streetphoto, #FFA500")).toBe(false);
    expect(isCategoryLine("")).toBe(false);
  });

  it("accepts a comma-separated hex palette", () => {
    expect(isPaletteLine("#F0E68C,#FFFFE0,#00FFFF")).toBe(true);
    expect(isPaletteLine("#F0E68C, #FFFFE0")).toBe(true);
  });

  it("rejects a palette line with words or partial colors", () => {
    expect(isPaletteLine("nature, landscape")).toBe(false);
    expect(isPaletteLine("#FFA500 and #00FF00")).toBe(false);
    expect(isPaletteLine("")).toBe(false);
  });

  it("accepts the description/categories/palette shape", () => {
    expect(
      isExpectedVisionShape([
        "A cartoon bee is illustrated with social media symbols around it.",
        "Illustration, Mascot, Icon",
        "#F0E68C,#FFFFE0,#00FFFF",
      ])
    ).toBe(true);
  });

  it("rejects markdown, JSON and other custom prompt answers", () => {
    expect(
      isExpectedVisionShape(["**Response:**", "This looks like a sunset photo.", "Tags: nature, landscape"])
    ).toBe(false);
    expect(isExpectedVisionShape(['{ "description": "a lake", "tags": ["nature"] }'])).toBe(false);
    expect(isExpectedVisionShape(["Only one line"])).toBe(false);
    expect(isExpectedVisionShape([])).toBe(false);
  });
});
