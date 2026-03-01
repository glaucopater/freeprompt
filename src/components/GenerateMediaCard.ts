export const GenerateMediaCard = () => `
  <div class="glass-card mt-4">
    <div class="flex items-center gap-2 mb-3">
      <span class="section-title-icon text-primary">🍌</span>
      <h2 class="section-title-heading fw-semibold mb-0">Generate image (Experimental)</h2>
    </div>

    <div class="form-group">
      <label for="gen-prompt" class="label">Prompt (if nothing happens ask directly to generate an image of...)</label>
      <textarea id="gen-prompt" class="form-control" rows="3" placeholder="Describe the media you want to generate (e.g. 'An image of cozy cabin at sunset')">An image of a cozy cabin at sunset</textarea>
    </div>

    <div class="flex gap-2 mb-3" style="flex-wrap: wrap;">
      <div class="form-group" style="flex: 1; min-width: 140px;">
        <label for="gen-type" class="label">Media Type</label>
        <select id="gen-type" class="form-select">
          <option value="image/jpg" selected>image/jpg</option>
          <option value="image/png">image/png</option>
          <option value="image/webp">image/webp</option>
        </select>
      </div>
      <div class="form-group" style="flex: 1; min-width: 140px;">
        <label for="gen-model" class="label">Model</label>
        <select id="gen-model" class="form-select">
          <option value="reve">reve latest</option>
        </select>
      </div>
    </div>

    <div class="flex gap-2 justify-center mt-2">
      <button id="generate-button" class="btn btn-primary">Generate</button>
      <button id="generate-reset" type="button" class="btn btn-outline-secondary">Reset</button>
    </div>

    <div id="generate-output" class="mt-4 d-none text-center">
      <div id="generated-media" class="mt-2"></div>
    </div>
  </div>`;
