export function SectionTitle(iconName: string, title: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "d-flex align-items-center gap-2 mb-3";

  const icon = document.createElement("span");
  icon.className = "text-primary fs-5";
  icon.textContent = iconName;

  const heading = document.createElement("h2");
  heading.className = "fs-4 fw-semibold text-dark mb-0";
  heading.textContent = title;

  container.append(icon, heading);
  return container;
}
