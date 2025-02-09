export const VideoExperiment = (
  uploadComponent: string
) => `<div class="container flex-grow-1 py-4">
      <div class="row g-4">
        <div class="col-12 col-lg-5">
          ${uploadComponent}
        </div>
        <div class="col-12 col-lg-7">
          <div id="analysis-vision-results" style="display: none"></div>
          <div id="analysis-audio-results" style="display: none"></div>
        </div>
      </div>
    </div>`;
