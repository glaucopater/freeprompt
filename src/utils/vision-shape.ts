const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

/** Comma-separated words, no colors. */
export function isCategoryLine(value: string) {
  const items = splitList(value);
  return items.length > 0 && items.every((item) => !item.startsWith("#"));
}

/** Comma-separated hex colors only. */
export function isPaletteLine(value: string) {
  const colors = splitList(value);
  return colors.length > 0 && colors.every((color) => HEX_COLOR.test(color));
}

/**
 * Shape produced by the bundled default prompt: description line, then
 * categories, then a hex palette. A custom prompt may answer in any format,
 * so callers must check before splitting.
 */
export function isExpectedVisionShape(lines: string[]) {
  return (
    lines.length >= 3 &&
    lines[0].trim() !== "" &&
    isCategoryLine(lines[1]) &&
    isPaletteLine(lines[2])
  );
}
