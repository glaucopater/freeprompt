import "./style.css";
import { updateHealthcheckStatusInterval } from "./setup.ts";
import appDetails from "../package.json";
import logo from "./assets/images/logo-no-bg.png";

const modalComponent = `<div
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
        data-bs-backdrop="static"
        data-bs-keyboard="false"
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
      </div>`;

const formComponent = `<form
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
      ${modalComponent}
    </form>`;

const headerComponent = `<header>
    <h1>FreePrompt 🔍</h1>
    <h3>Totally Free image classification with and LLM API integration</h3>            
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
  <div>
    ${headerComponent}
    <img src='${logo}' alt='Logo' class='logo' />
    <h5>Image classification with Gen AI (Gemini):</h5>
    ${formComponent}
    ${statusComponent}   
    ${footerComponent}
  </div>
`;

updateHealthcheckStatusInterval();
