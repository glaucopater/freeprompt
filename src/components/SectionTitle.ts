export function SectionTitle(iconName: string, title: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex items-center gap-2 mb-3";

  const icon = document.createElement("span");
  icon.className = "section-title-icon text-primary";
  icon.textContent = iconName;

  const heading = document.createElement("h2");
  heading.className = "section-title-heading fw-semibold mb-0";
  heading.textContent = title;

  container.append(icon, heading);
  return container;
}
