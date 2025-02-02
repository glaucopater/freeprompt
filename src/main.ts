import "./style.css";
import { updateHealthcheckStatusInterval } from "./setup.ts";
import appDetails from "../package.json";
import logo from "./assets/images/logo-no-bg.png";

const uploadProgressModal = `<div
        class="modal fade"
        id="upload-modal"
        tabindex="-1"
        aria-labelledby="upload-modal-label"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="upload-modal-label">
                Upload Progress
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="progress">
                <div
                  class="progress-bar"
                  id="upload-progress"
                  role="progressbar"
                  aria-valuenow="0"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <p id="upload-progress-text">0%</p>
            </div>
          </div>
        </div>
      </div>`;

const uploadComponent = `
  <div class="card shadow-sm">
    <div class="card-body">
      <h2 class="fs-4 fw-semibold mb-4">Uploaded Image</h2>
      <form
        action="/upload-and-analyze"
        method="post"
        enctype="multipart/form-data"
        id="upload-form"
      >
        <div class="upload-area" id="upload-area">
          <p>Drag and drop a file here or click to upload</p>
          <p class="file-info" id="file-info"></p>
          <input type="file" id="file-input" name="file" style="display: none" accept="image/*" />
          <img id="image-preview" class="img-fluid mt-3 d-none" alt="Preview" style="max-height: 200px;" />
        </div>
        <div class="form-check form-switch mt-3">
          <input class="form-check-input" type="checkbox" role="switch" id="auto-upload-switch" checked>
          <label class="form-check-label" for="auto-upload-switch">Auto-upload and analyze</label>
        </div>
        <button
          type="submit"
          class="btn btn-primary mx-auto d-block mt-4"
          id="upload-button"
          disabled
        >
          Upload and Analyze Images
        </button>
        <div class="text-center" id="spinner" style="display: none">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Uploading...</span>
          </div>
        </div>
      </form>
    </div>
  </div>
  ${uploadProgressModal}`;

const headerComponent = `<header>
  <img src='${logo}' alt='FreePrompt' title='FreePrompt' class='logo'  />
  <h2>Totally Free image classification with and LLM API integration</h2>            
</header>`;

const statusComponent = `<div>
    <span class="text-muted">Status: </span>
    <span id="healthcheck-status">🔴</span>
  </div>`;

const footerComponent = `<footer>
  <div>
    <p>Disclaimer: Images are not stored. All images are processed in real-time and deleted immediately after processing.</p>
    <p><a href="https://github.com/glaucopater/freeprompt"><i class="fa-brands fa-github"></i> Github</a></p>
    <p>Version ${appDetails.version}</p>
  </div>
</footer>`;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="min-vh-100 d-flex flex-column">
    ${headerComponent}    
    <h5>Experiment 1: Image classification with Gen AI (Gemini)</h5>
    <div class="container flex-grow-1 py-4">
      <div class="row g-4">
        <div class="col-12 col-lg-5">
          ${uploadComponent}
        </div>
        <div class="col-12 col-lg-7">
          <div id="analysis-results" style="display: none"></div>
        </div>
      </div>
    </div>
    ${statusComponent}   
    ${footerComponent}
  </div>
`;

updateHealthcheckStatusInterval();
