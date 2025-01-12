import "./style.css";
import { setupEvents } from "./setup.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
      <form
      action="/upload-and-analyze"
      method="post"
      enctype="multipart/form-data"
      id="upload-form"
    >
      <div class="upload-area" id="upload-area">
        <p>Drag and drop a file here or click to upload</p>
        <p class="file-info" id="file-info"></p>
        <input type="file" id="file-input" name="file" style="display: none" />
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
      <div
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
      </div>
      <div
        class="modal fade"
        id="response-modal"
        tabindex="-1"
        aria-labelledby="response-modal-label"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="response-modal-label">Response</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div id="response-content"></div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
`;

setupEvents();
