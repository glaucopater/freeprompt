import { GEMINI_MODEL_INFO, DEFAULT_GEMINI_MODEL, IMAGE_GENERATION_MODELS } from "../../netlify/functions/models";

export const GenerateMediaCard = () => `
  <div class="card shadow-sm mt-4">
    <div class="card-body">
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="text-primary fs-5">🍌</span>
        <h2 class="fs-4 fw-semibold text-dark mb-0">Generate image (Experimental)</h2>
      </div>

      <div class="mb-3">
        <label for="gen-prompt" class="form-label">Prompt (if nothing happens ask directly to generate an image of...)</label>
        <textarea id="gen-prompt" class="form-control" rows="3" placeholder="Describe the media you want to generate (e.g. 'An image of cozy cabin at sunset')">An image of a cozy cabin at sunset</textarea>
        <textarea id="gen-prompt-fixed" class="form-control" rows="2" placeholder="Extra Prompt"> and give me also a title and description for the image.</textarea>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-12 col-md-6">
          <label for="gen-type" class="form-label">Media Type</label>
          <select id="gen-type" class="form-select">
            <option value="image" selected>Image</option>            
          </select>
        </div>
        <div class="col-12 col-md-6">
          <label for="gen-model" class="form-label">Model</label>
          <select id="gen-model" class="form-select">
            ${IMAGE_GENERATION_MODELS.slice(0, 2).map((value) => {
  const info = GEMINI_MODEL_INFO.find(m => m.value === value);
  const name = info ? info.name.replace(/_/g, ' ').replace(/GEMINI/g, 'Gemini') : value;
  const desc = info ? ` (${info.description})` : '';
  return `
              <option value="${value}" ${value === DEFAULT_GEMINI_MODEL ? 'selected' : ''}>
                ${name}${desc}
              </option>
            `}).join('')}
          </select>
        </div>
      </div>

      <div class="d-flex gap-2 justify-content-center mt-2">
        <button id="generate-button" class="btn btn-primary">Generate</button>
        <button id="generate-reset" type="button" class="btn btn-outline-secondary">Reset</button>
      </div>

      <div id="generate-output" class="mt-4 d-none text-center">        
        <div id="generated-media" class="mt-2"></div>
      </div>
    </div>
  </div>`;
