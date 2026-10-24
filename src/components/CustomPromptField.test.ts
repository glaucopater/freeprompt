import { describe, expect, it } from "vitest";
import { CustomPromptField } from "./CustomPromptField";
import { UploadFilesCard } from "./UploadImageCard";

describe("CustomPromptField", () => {
  it("renders a textarea that overrides the analysis prompt", () => {
    const field = CustomPromptField();

    expect(field).toContain('<textarea id="custom-prompt"');
    expect(field).toContain('for="custom-prompt"');
    expect(field).toContain('id="custom-prompt-show-default"');
    expect(field).toContain("Leave empty to use the default prompt");
  });

  it("starts empty so the default prompt is used", () => {
    expect(CustomPromptField()).toMatch(/<textarea[^>]*><\/textarea>/);
  });
});

describe("UploadFilesCard", () => {
  it("includes the custom prompt field inside the upload form", () => {
    const card = UploadFilesCard("");

    expect(card).toContain('id="upload-form"');
    expect(card).toContain('id="custom-prompt"');

    const formStart = card.indexOf('id="upload-form"');
    const fieldStart = card.indexOf('id="custom-prompt"');
    expect(fieldStart).toBeGreaterThan(formStart);
  });
});
