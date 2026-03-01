export const VisionExperiment = (
  uploadComponent: string
) => `<div class="app-layout flex-1">
  <div id="upload-column" class="upload-column transition-width">
    <div class="flex flex-col">
      ${uploadComponent}
    </div>
  </div>
  <div id="results-column" class="results-column d-none">
    <div class="results-container flex flex-col">
      <div id="analysis-vision-results" class="opacity-0"></div>
      <div id="analysis-audio-results" class="opacity-0"></div>
    </div>
  </div>
</div>`;
