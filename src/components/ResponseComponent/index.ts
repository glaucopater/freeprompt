import { AnalysisData } from "../../types";

let analysisData: AnalysisData;

export const updateAnalysisData = (data: AnalysisData) => {
  analysisData = data;
};

function createSectionTitle(iconName: string, title: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "d-flex align-items-center gap-2 mb-3";

  const icon = document.createElement("i");
  icon.dataset.lucide = iconName;
  icon.className = "text-primary";
  icon.style.width = "20px";
  icon.style.height = "20px";

  const heading = document.createElement("h2");
  heading.className = "fs-4 fw-semibold text-dark mb-0";
  heading.textContent = title;

  container.append(icon, heading);
  return container;
}

function createColorSwatch(color: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "d-flex flex-column align-items-center gap-1";

  const swatch = document.createElement("div");
  swatch.className = "rounded border";
  swatch.style.width = "48px";
  swatch.style.height = "48px";
  swatch.style.backgroundColor = color;
  swatch.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.05)";

  const text = document.createElement("span");
  text.className = "small font-monospace text-secondary";
  text.textContent = color;

  container.append(swatch, text);
  return container;
}

export function ResponseComponent(analysisData: AnalysisData): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "min-vh-100 bg-light py-4";

  const content = document.createElement("div");
  content.className = "container";

  const row = document.createElement("div");
  row.className = "row justify-content-center";

  const col = document.createElement("div");
  col.className = "col-12 col-lg-8";

  // Header
  const header = document.createElement("div");
  header.className = "text-center mb-4";
  header.innerHTML = `
      <h1 class="display-5 fw-bold mb-2">Image Analysis Results</h1>
      <p class="text-secondary">Detailed breakdown of your image</p>
    `;

  // Description Section
  const descriptionSection = document.createElement("div");
  descriptionSection.className = "card shadow-sm mb-4";
  const descriptionBody = document.createElement("div");
  descriptionBody.className = "card-body";
  descriptionBody.append(createSectionTitle("image", "Description"));

  const description = document.createElement("p");
  description.className = "text-secondary mb-0";
  description.textContent = analysisData.description;
  descriptionBody.append(description);
  descriptionSection.append(descriptionBody);

  // Categories Section
  const categoriesSection = document.createElement("div");
  categoriesSection.className = "card shadow-sm mb-4";
  const categoriesBody = document.createElement("div");
  categoriesBody.className = "card-body";
  categoriesBody.append(createSectionTitle("tag", "Categories"));

  const categoriesContainer = document.createElement("div");
  categoriesContainer.className = "d-flex flex-wrap gap-2";

  analysisData.categories.forEach((category) => {
    const tag = document.createElement("span");
    tag.className =
      "badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2";
    tag.textContent = category;
    categoriesContainer.append(tag);
  });

  categoriesBody.append(categoriesContainer);
  categoriesSection.append(categoriesBody);

  // Color Palette Section
  const paletteSection = document.createElement("div");
  paletteSection.className = "card shadow-sm mb-4";
  const paletteBody = document.createElement("div");
  paletteBody.className = "card-body";
  paletteBody.append(createSectionTitle("palette", "Color Palette"));

  const paletteContainer = document.createElement("div");
  paletteContainer.className = "d-flex justify-content-center flex-wrap gap-4";

  analysisData.palette.forEach((color) => {
    paletteContainer.append(createColorSwatch(color));
  });

  paletteBody.append(paletteContainer);
  paletteSection.append(paletteBody);

  // Combine all sections
  col.append(header, descriptionSection, categoriesSection, paletteSection);
  row.append(col);
  content.append(row);
  container.append(content);

  return container;
}

// Initialize the app

/*
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    app.append(createApp());
    // Initialize Lucide icons
    lucide.createIcons();
  }
});
*/
