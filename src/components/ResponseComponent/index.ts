import { AnalysisData } from "../../types";

let analysisData: AnalysisData;

export const updateAnalysisData = (data: AnalysisData) => {
  console.log("Raw Analysis Data:", data);
  analysisData = data;

  const resultsContainer = document.getElementById("analysis-results");
  if (resultsContainer) {
    resultsContainer.style.display = "block";
    resultsContainer.innerHTML = "";
    resultsContainer.append(ResponseComponent(data));
  }
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

export function ResponseComponent(analysisData: AnalysisData): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "d-flex flex-column gap-3";

  // Description Section
  const descriptionSection = document.createElement("div");
  descriptionSection.className = "bg-white rounded-3 p-4";
  const descriptionBody = document.createElement("div");
  descriptionBody.className = "";
  descriptionBody.append(createSectionTitle("image-plus", "Description"));

  const description = document.createElement("p");
  description.className = "text-secondary mb-0 text-justify";
  description.style.textAlign = "justify";
  description.textContent = analysisData.description;
  descriptionBody.append(description);
  descriptionSection.append(descriptionBody);

  // Categories Section
  const categoriesSection = document.createElement("div");
  categoriesSection.className = "bg-white rounded-3 p-4";
  const categoriesBody = document.createElement("div");
  categoriesBody.className = "";
  categoriesBody.append(createSectionTitle("tags", "Categories"));

  const categoriesContainer = document.createElement("div");
  categoriesContainer.className = "d-flex flex-wrap gap-2";

  analysisData.categories.forEach((category) => {
    const tag = document.createElement("span");
    tag.className =
      "badge bg-primary-subtle text-primary rounded-pill px-3 py-2";
    tag.textContent = category;
    categoriesContainer.append(tag);
  });

  categoriesBody.append(categoriesContainer);
  categoriesSection.append(categoriesBody);

  // Color Palette Section
  const paletteSection = document.createElement("div");
  paletteSection.className = "bg-white rounded-3 p-4";
  const paletteBody = document.createElement("div");
  paletteBody.className = "";
  paletteBody.append(createSectionTitle("palette", "Color Palette"));

  const paletteContainer = document.createElement("div");
  paletteContainer.className = "d-flex gap-4";

  analysisData.palette.forEach((color) => {
    paletteContainer.append(createColorSwatch(color));
  });

  paletteBody.append(paletteContainer);
  paletteSection.append(paletteBody);

  // Combine all sections
  container.append(descriptionSection, categoriesSection, paletteSection);

  return container;
}
