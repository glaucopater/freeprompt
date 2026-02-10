import { GEMINI_MODEL_INFO, DEFAULT_GEMINI_MODEL, NOT_SUPPORTED_FOR_IMAGE_ANALYSE } from "../../netlify/functions/models";

export const UploadFilesCard = (uploadProgressModal: string) => `
  <div class="glass-card">
    <div class="flex items-center gap-2 mb-3">
      <span class="section-title-icon text-primary">🔬</span>
      <h2 class="section-title-heading fw-semibold mb-0">Media Analyzer</h2>
    </div>
    <form
      action="/upload-and-analyze"
      method="post"
      enctype="multipart/form-data"
      id="upload-form"
    >
      <div class="upload-area upload-zone" id="upload-area">
        <p id="upload-guide">Drag and drop a file here or click to upload</p>
        <input type="file" id="file-input" name="file" class="d-none" accept="image/*, audio/*" />
        <img id="image-preview" class="upload-preview-image d-none" alt="Preview" />
        <audio id="audio-preview" class="w-100 mt-3 d-none" controls></audio>
      </div>
      <p class="file-info mt-2 text-center" id="file-info"></p>
      <div class="form-group">
        <label for="model-select" class="label">Select Model (sorted by performance)</label>
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
      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" role="switch" id="auto-upload-switch" checked />
        <label class="form-check-label" for="auto-upload-switch">Auto-analyze</label>
      </div>
      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" role="switch" id="auto-shrink-switch" checked />
        <label class="form-check-label" for="auto-shrink-switch">Auto shrink image</label>
      </div>
      <div class="flex gap-2 justify-center mt-4">
        <button type="submit" class="btn btn-primary" id="upload-button" disabled>
          Analyze Images or Audio Files
        </button>
        <button type="button" class="btn btn-outline-secondary" id="reset-button">
          Reset
        </button>
      </div>
      <div class="text-center mt-2 d-none" id="spinner">
        <div class="spinner" role="status" aria-label="Uploading"></div>
      </div>
    </form>
  </div>
  ${uploadProgressModal}`;
