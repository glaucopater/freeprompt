export function ColorSwatch(color: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-2";

  const swatch = document.createElement("div");
  swatch.style.width = "64px";
  swatch.style.height = "64px";
  swatch.style.backgroundColor = color;
  swatch.style.border = "1px solid hsl(var(--border))";
  swatch.style.borderRadius = "4px";
  swatch.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";

  const text = document.createElement("span");
  text.className = "font-mono text-secondary text-sm";
  text.textContent = color.toUpperCase();

  container.append(swatch, text);
  return container;
}
