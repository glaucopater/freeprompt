import "./style.css";
import { updateHealthcheckStatusInterval } from "./setup.ts";

import appDetails from "../package.json";
import logo from "./assets/images/logo-no-bg.png";
import { Footer } from "./components/Footer.ts";
import { Status } from "./components/Status.ts";
import { Header } from "./components/Header.ts";
import { AudioExperiment } from "./components/AudioExperiment.ts";
import { VideoExperiment } from "./components/VideoExperiment.ts";

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

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="min-vh-100 d-flex flex-column">
    ${Header(logo)}    
    ${VideoExperiment(uploadComponent)}
    ${AudioExperiment()}
    ${Status()}
    ${Footer(appDetails)}
  </div>
`;

updateHealthcheckStatusInterval();
