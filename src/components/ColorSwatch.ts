export function ColorSwatch(color: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "d-flex flex-column gap-2";

  const swatch = document.createElement("div");
  swatch.style.width = "64px";
  swatch.style.height = "64px";
  swatch.style.backgroundColor = color;
  swatch.style.border = "1px solid #dee2e6";
  swatch.style.borderRadius = "4px";
  swatch.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";

  const text = document.createElement("span");
  text.className = "font-monospace text-secondary";
  text.style.fontSize = "12px";
  text.textContent = color.toUpperCase();

  container.append(swatch, text);
  return container;
}
