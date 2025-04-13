export const VisionExperiment = (
  uploadComponent: string
) => `<div class="container flex-grow-1 py-4">
      <div class="row g-4">
        <div id="upload-column" class="col-12 transition-width">
          <div class="h-100 d-flex flex-column">
            ${uploadComponent}
          </div>
        </div>
        <div id="results-column" class="col-12 col-lg-7 d-none">
          <div class="results-container h-100 d-flex flex-column">
            <div id="analysis-vision-results" class="h-100 opacity-0"></div>
            <div id="analysis-audio-results" class="h-100 opacity-0"></div>
          </div>
        </div>
      </div>
    </div>
    <style>
      .container {
        min-height: 600px;
      }
      .transition-width {
        transition: all 0.3s ease-in-out;
      }
      #upload-column,
      #results-column {
        height: 100%;
      }
      .results-container {
        height: 100%;
      }
      #analysis-vision-results,
      #analysis-audio-results {
        transition: opacity 0.3s ease-in-out;
      }
      #analysis-vision-results.fade-in,
      #analysis-audio-results.fade-in {
        opacity: 1 !important;
      }
      @media (min-width: 992px) {
        .transition-width.has-results {
          width: 41.666667%;
        }
        .row {
          height: 100%;
        }
      }
    </style>`;
