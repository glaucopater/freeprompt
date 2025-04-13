import { GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "../../netlify/functions/models";

export const UploadFilesCard = () => `
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
          <audio id="audio-preview" class="w-100 mt-3 d-none" controls></audio>
        </div>
        <div class="mb-3">
          <label for="model-select" class="form-label">Select Model</label>
          <select class="form-select" id="model-select" name="model">
            ${Object.entries(GEMINI_MODELS)
              .map(([key, value]) => `
                <option value="${value}" ${value === DEFAULT_GEMINI_MODEL ? 'selected' : ''}>
                  ${key.replace(/_/g, ' ').replace(/GEMINI/g, 'Gemini')}
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
      </form>
    </div>
  </div>`; 