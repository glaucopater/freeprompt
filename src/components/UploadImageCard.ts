import { GEMINI_MODEL_INFO, DEFAULT_GEMINI_MODEL, NOT_SUPPORTED_FOR_IMAGE_ANALYSE } from "../../netlify/functions/models";

export const UploadFilesCard = (uploadProgressModal: string) => `
  <div class="card shadow-sm">
    <div class="card-body">      
      <form
        action="/upload-and-analyze"
        method="post"
        enctype="multipart/form-data"
        id="upload-form"
      >
        <div class="upload-area" id="upload-area">
          <p id="upload-guide">Drag and drop a file here or click to upload</p>
          <p class="file-info" id="file-info"></p>
          <input type="file" id="file-input" name="file" style="display: none" accept="image/*, audio/*" />
          <img id="image-preview" class="img-fluid mt-3 d-none" alt="Preview" style="max-height: 200px;" />
        </div>
        <div class="mb-3">
          <label for="model-select" class="form-label">Select Model (sorted by perfomance)</label>
          <select class="form-select" id="model-select" name="model">
            ${GEMINI_MODEL_INFO
              .filter(model => !NOT_SUPPORTED_FOR_IMAGE_ANALYSE.includes(model.value))
              .map(({ name, value, description }) => `
                <option value="${value}" ${value === DEFAULT_GEMINI_MODEL ? 'selected' : ''}>
                  ${name.replace(/_/g, ' ').replace(/GEMINI/g, 'Gemini')} (${description})
                </option>
              `)
              .join('')}
          </select>
        </div>
        <div class="form-check form-switch p-0">
          <div class="d-inline-flex flex-row-reverse gap-1">
            <input class="form-check-input ms-0" type="checkbox" role="switch" id="auto-upload-switch" checked/>
            <label class="form-check-label" for="auto-upload-switch">Auto-analyze</label>
          </div>
        </div>
        <div class="form-check form-switch p-0 mt-2">
          <div class="d-inline-flex flex-row-reverse gap-1">
            <input class="form-check-input ms-0" type="checkbox" role="switch" id="auto-shrink-switch" checked />
            <label class="form-check-label" for="auto-shrink-switch">Auto shrink image</label>
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-center mt-4">
          <button
            type="submit"
            class="btn btn-primary"
            id="upload-button"
            disabled
          >
            Analyze Images or Audio Files
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            id="reset-button"
          >
            Reset
          </button>
        </div>
        <div class="text-center" id="spinner" style="display: none">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Uploading...</span>
          </div>
        </div>
      </form>
    </div>
  </div>
  ${uploadProgressModal}`;

