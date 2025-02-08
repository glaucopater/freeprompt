export const VideoExperiment = (
  uploadComponent: string
) => ` <h5>Experiment 1: Image classification </h5>
    <div class="container flex-grow-1 py-4">
      <div class="row g-4">
        <div class="col-12 col-lg-5">
          ${uploadComponent}
        </div>
        <div class="col-12 col-lg-7">
          <div id="analysis-vision-results" style="display: none"></div>
        </div>
      </div>
    </div>`;
