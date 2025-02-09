import { AnalysisHearingData, AnalysisVisionData } from "../../types";
import { ColorSwatch } from "../ColorSwatch";
import { SectionTitle } from "../SectionTitle";

export const updateVisionAnalysisData = (data: AnalysisVisionData) => {
  console.log("Raw Analysis Data:", data);

  const resultsContainer = document.getElementById("analysis-vision-results");
  if (resultsContainer) {
    resultsContainer.style.display = "block";
    resultsContainer.innerHTML = "";
    resultsContainer.append(ResponseVisionComponent(data));
  }
};

export function ResponseVisionComponent(
  analysisData: AnalysisVisionData
): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "d-flex flex-column gap-3";

  // Description Section
  const descriptionSection = document.createElement("div");
  descriptionSection.className = "bg-white rounded-3 p-4";
  const descriptionBody = document.createElement("div");
  descriptionBody.className = "";
  descriptionBody.append(SectionTitle("image-plus", "Description"));

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
  categoriesBody.append(SectionTitle("tags", "Categories"));

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
  paletteBody.append(SectionTitle("palette", "Color Palette"));

  const paletteContainer = document.createElement("div");
  paletteContainer.className = "d-flex gap-4";

  analysisData.palette.forEach((color) => {
    paletteContainer.append(ColorSwatch(color));
  });

  paletteBody.append(paletteContainer);
  paletteSection.append(paletteBody);

  // Combine all sections
  container.append(descriptionSection, categoriesSection, paletteSection);

  return container;
}

export function ResponseHearingComponent(
  analysisData: AnalysisHearingData
): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "d-flex flex-column gap-3";

  // Description Section
  const descriptionSection = document.createElement("div");
  descriptionSection.className = "bg-white rounded-3 p-4";
  const descriptionBody = document.createElement("div");
  descriptionBody.className = "";
  descriptionBody.append(SectionTitle("image-plus", "Description"));

  const description = document.createElement("p");
  description.className = "text-secondary mb-0 text-justify";
  description.style.textAlign = "justify";
  description.textContent = analysisData.description;
  descriptionBody.append(description);
  descriptionSection.append(descriptionBody);

  container.append(descriptionSection);

  return container;
}
