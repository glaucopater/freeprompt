import { AnalysisHearingData, AnalysisVisionData } from "../../types";
import { formatFileSize } from "../../utils";
import { ColorSwatch } from "../ColorSwatch";
import { SectionTitle } from "../SectionTitle";

export const updateVisionAnalysisData = (data: AnalysisVisionData) => {
  const resultsContainer = document.getElementById("analysis-vision-results");
  if (resultsContainer) {
    resultsContainer.style.display = "block";
    resultsContainer.innerHTML = "";
    resultsContainer.append(ResponseVisionComponent(data));
  }
};

export function ResponseVisionComponent(
  analysisData: AnalysisVisionData | null = null
): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "flex flex-col gap-3 h-100";

  if (!analysisData) {
    const loadingSection = document.createElement("div");
    loadingSection.className = "card p-4 h-100";
    const loadingBody = document.createElement("div");
    loadingBody.className = "flex justify-center items-center h-100 py-4";
    loadingBody.innerHTML = `
      <div class="spinner" role="status" aria-label="Loading"></div>
    `;
    loadingSection.append(loadingBody);
    container.append(loadingSection);
    container.dataset.startTime = Date.now().toString();
    return container;
  }

  // Description Section
  const descriptionSection = document.createElement("div");
  descriptionSection.className = "card p-4";
  const descriptionBody = document.createElement("div");
  descriptionBody.append(SectionTitle("📝", "Description"));

  const description = document.createElement("p");
  description.className = "text-secondary mb-0 text-justify";
  description.style.textAlign = "justify";
  description.textContent = analysisData.description;
  descriptionBody.append(description);
  descriptionSection.append(descriptionBody);

  // Categories Section
  const categoriesSection = document.createElement("div");
  categoriesSection.className = "card p-4";
  const categoriesBody = document.createElement("div");
  categoriesBody.append(SectionTitle("🏷️", "Categories"));

  const categoriesContainer = document.createElement("div");
  categoriesContainer.className = "flex flex-wrap gap-2";

  analysisData.categories.forEach((category) => {
    const tag = document.createElement("span");
    tag.className = "badge";
    tag.textContent = category;
    categoriesContainer.append(tag);
  });

  categoriesBody.append(categoriesContainer);
  categoriesSection.append(categoriesBody);

  // Color Palette Section
  const paletteSection = document.createElement("div");
  paletteSection.className = "card p-4";
  const paletteBody = document.createElement("div");
  paletteBody.append(SectionTitle("🎨", "Color Palette"));

  const paletteContainer = document.createElement("div");
  paletteContainer.className = "flex gap-4 flex-wrap";

  analysisData.palette.forEach((color) => {
    paletteContainer.append(ColorSwatch(color));
  });

  paletteBody.append(paletteContainer);
  paletteSection.append(paletteBody);

  // Image Stats Section
  const imageStatsSection = document.createElement("div");
  imageStatsSection.className = "card p-4";
  const imageStatsBody = document.createElement("div");
  imageStatsBody.append(SectionTitle("📊", "Image Stats"));

  const imageStatsInfo = document.createElement("p");
  imageStatsInfo.className = "text-secondary mb-0 text-start";
  if (analysisData.imageStats) {
    const s = analysisData.imageStats;
    const originalDims = s.originalWidth && s.originalHeight ? `${s.originalWidth}x${s.originalHeight}` : 'unknown';
    const originalAR = s.originalAspectRatio ? s.originalAspectRatio.toFixed(2) : 'unknown';
    let resizedLine = '';
    // Only show resized metrics if they differ from the original
    if (!(s.resizedWidth === s.originalWidth && s.resizedHeight === s.originalHeight)) {
      const resizedDims = s.resizedWidth && s.resizedHeight ? `${s.resizedWidth}x${s.resizedHeight}` : 'unknown';
      const resizedAR = s.resizedAspectRatio ? s.resizedAspectRatio.toFixed(2) : 'unknown';
      resizedLine = `<br><strong>Resized Size:</strong> ${formatFileSize(s.resizedSize)} (${resizedDims}, Aspect Ratio: ${resizedAR})`;
    }

    imageStatsInfo.innerHTML = `<strong>Original Size:</strong> ${formatFileSize(s.originalSize)} (${originalDims}, Aspect Ratio: ${originalAR})${resizedLine}`;
  }
  imageStatsBody.append(imageStatsInfo);
  imageStatsSection.append(imageStatsBody);

  // Processing Time Section
  const timeSection = document.createElement("div");
  timeSection.className = "card p-4";
  const timeBody = document.createElement("div");
  timeBody.append(SectionTitle("⏱️", "Processing Time"));

  const timeInfo = document.createElement("p");
  timeInfo.className = "text-secondary mb-0 text-start";
  timeInfo.innerHTML = `<strong>Time:</strong> ${(analysisData.processingTime / 1000).toFixed(3)} seconds<br><strong>Model:</strong> ${analysisData.model}`;
  timeBody.append(timeInfo);
  timeSection.append(timeBody);

  // Combine all sections
  container.append(descriptionSection, categoriesSection, paletteSection, imageStatsSection, timeSection);

  return container;
}


export function ResponseHearingComponent(
  analysisData: AnalysisHearingData | null
): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "flex flex-col gap-3 h-100";

  if (!analysisData) {
    const loadingSection = document.createElement("div");
    loadingSection.className = "card p-4 h-100";
    const loadingBody = document.createElement("div");
    loadingBody.className = "flex justify-center items-center h-100 py-4";
    loadingBody.innerHTML = `
      <div class="spinner" role="status" aria-label="Loading"></div>
    `;
    loadingSection.append(loadingBody);
    container.append(loadingSection);
    container.dataset.startTime = Date.now().toString();
    return container;
  }

  // Transcript Section
  const transcriptSection = document.createElement("div");
  transcriptSection.className = "card p-4";
  const transcriptBody = document.createElement("div");
  transcriptBody.append(SectionTitle("🎤", "Transcript"));

  const transcript = document.createElement("p");
  transcript.className = "text-secondary mb-0 text-justify";
  transcript.style.textAlign = "justify";
  transcript.textContent = analysisData.transcript;
  transcriptBody.append(transcript);
  transcriptSection.append(transcriptBody);

  // Language Section
  const languageSection = document.createElement("div");
  languageSection.className = "card p-4";
  const languageBody = document.createElement("div");
  languageBody.append(SectionTitle("🌐", "Language Details"));

  const languageInfo = document.createElement("p");
  languageInfo.className = "text-secondary mb-0";
  languageInfo.innerHTML = `
    <strong>Detected Language:</strong> ${analysisData.language}<br>
    ${analysisData.translation ? `<strong>Translation:</strong> ${analysisData.translation}` : ''}
  `;
  languageBody.append(languageInfo);
  languageSection.append(languageBody);

  // Processing Time Section
  const startTime = parseInt(container.dataset.startTime || Date.now().toString());
  const processingTime = ((Date.now() - startTime) / 1000).toFixed(3);

  const timeSection = document.createElement("div");
  timeSection.className = "card p-4";
  const timeBody = document.createElement("div");
  timeBody.append(SectionTitle("⏱️", "Processing Time"));

  const timeInfo = document.createElement("p");
  timeInfo.className = "text-secondary mb-0";
  timeInfo.innerHTML = `<strong>Time:</strong> ${processingTime} seconds`;
  timeBody.append(timeInfo);
  timeSection.append(timeBody);

  // Combine all sections
  container.append(transcriptSection, languageSection, timeSection);

  return container;
}

