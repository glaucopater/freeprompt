import { AnalysisHearingData } from "../../types";
import { SectionTitle } from "../SectionTitle";

export function ResponseHearingComponent(
  analysisData: AnalysisHearingData | null = null,
  audioSrc?: string
): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "response-component";
  container.className = "d-flex flex-column gap-3 h-100";

  if (!analysisData) {
    const loadingSection = document.createElement("div");
    loadingSection.className = "card shadow-sm bg-white rounded-3 p-4 h-100";
    const loadingBody = document.createElement("div");
    loadingBody.className = "d-flex justify-content-center align-items-center h-100 py-4";
    loadingBody.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
    loadingSection.append(loadingBody);
    container.append(loadingSection);
    return container;
  }

  // Audio Player Section (if audio source is provided)
  if (audioSrc) {
    const audioSection = document.createElement("div");
    audioSection.className = "card shadow-sm bg-white rounded-3 p-4";
    const audioBody = document.createElement("div");
    audioBody.className = "";
    audioBody.append(SectionTitle("🎵", "Audio File"));

    const audio = document.createElement("audio");
    audio.className = "w-100";
    audio.controls = true;
    audio.src = audioSrc;
    audioBody.append(audio);
    audioSection.append(audioBody);
    container.append(audioSection);
  }

  // Transcript Section
  const transcriptSection = document.createElement("div");
  transcriptSection.className = "card shadow-sm bg-white rounded-3 p-4";
  const transcriptBody = document.createElement("div");
  transcriptBody.className = "";
  transcriptBody.append(SectionTitle("🎤", "Transcript"));

  const transcript = document.createElement("p");
  transcript.className = "text-secondary mb-0 text-justify";
  transcript.style.textAlign = "justify";
  transcript.style.whiteSpace = "pre-line";
  transcript.textContent = analysisData.transcript;
  transcriptBody.append(transcript);
  transcriptSection.append(transcriptBody);

  // Language Section
  const languageSection = document.createElement("div");
  languageSection.className = "card shadow-sm bg-white rounded-3 p-4";
  const languageBody = document.createElement("div");
  languageBody.className = "";
  languageBody.append(SectionTitle("🌐", "Language Details"));

  const languageInfo = document.createElement("p");
  languageInfo.className = "text-secondary mb-0 text-start";
  languageInfo.innerHTML = `<strong>Detected Language:</strong> ${analysisData.language}${analysisData.translation ? `<br><strong>Translation:</strong> ${analysisData.translation}` : ''}`;
  languageBody.append(languageInfo);
  languageSection.append(languageBody);

  // Processing Time Section
  const timeSection = document.createElement("div");
  timeSection.className = "card shadow-sm bg-white rounded-3 p-4";
  const timeBody = document.createElement("div");
  timeBody.className = "";
  timeBody.append(SectionTitle("⏱️", "Processing Time"));

  const timeInfo = document.createElement("p");
  timeInfo.className = "text-secondary mb-0 text-start";
  timeInfo.innerHTML = `<strong>Time:</strong> ${(analysisData.processingTime / 1000).toFixed(3)} seconds<br><strong>Model:</strong> ${analysisData.model}`;
  timeBody.append(timeInfo);
  timeSection.append(timeBody);

  // Combine all sections
  container.append(transcriptSection, languageSection, timeSection);

  return container;
}
