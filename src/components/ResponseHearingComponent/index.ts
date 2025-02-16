import { AnalysisHearingData } from "../../types";
import { SectionTitle } from "../SectionTitle";

export function ResponseHearingComponent(
  analysisData: AnalysisHearingData
): HTMLDivElement {
  console.log("Raw Analysis Data:", analysisData);

  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "d-flex flex-column gap-3";

  // Description Section
  const descriptionSection = document.createElement("div");
  descriptionSection.className = "bg-white rounded-3 p-4";
  const descriptionBody = document.createElement("div");
  descriptionBody.className = "";
  descriptionBody.append(SectionTitle("image-plus", "Transcription"));

  const description = document.createElement("p");
  description.className = "text-secondary mb-0 text-justify";
  description.style.textAlign = "justify";
  description.style.whiteSpace = "pre-line";

  description.textContent = [
    analysisData.transcript,
    analysisData.language,
    analysisData.translation,
  ].join("\r\n");
  descriptionBody.append(description);
  descriptionSection.append(descriptionBody);

  container.append(descriptionSection);

  return container;
}
