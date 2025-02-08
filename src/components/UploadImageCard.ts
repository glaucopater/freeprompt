export const UploadImageCard = (uploadProgressModal: string) => `
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
