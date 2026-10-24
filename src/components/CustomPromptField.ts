/**
 * Optional prompt field that overrides the default image-analysis prompt.
 * Left empty, the server-side default (VISION_PROMPTS[0]) is used.
 */
export const CustomPromptField = () => `
  <div class="form-group mt-2" id="custom-prompt-group">
    <label for="custom-prompt" class="label">Custom prompt (optional)</label>
    <textarea id="custom-prompt" class="form-control" rows="3" placeholder="Leave empty to use the default prompt"></textarea>
    <div class="flex gap-2 mt-1">
      <button type="button" class="btn btn-outline-secondary btn-sm" id="custom-prompt-show-default">Show default prompt</button>
    </div>
    <p class="text-muted text-sm mt-1">Image analysis only. A non-empty value replaces the default prompt and is kept in this browser.</p>
  </div>`;
