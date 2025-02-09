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
        <div class="form-check form-switch p-0">
          <div class="d-inline-flex flex-row-reverse gap-1">
            <input class="form-check-input ms-0" type="checkbox" role="switch" id="auto-upload-switch" checked/>
            <label class="form-check-label" for="auto-upload-switch">Auto-analyze</label>
          </div>
        </div>
        <button
          type="submit"
          class="btn btn-primary mx-auto d-block mt-4"
          id="upload-button"
          disabled
        >
          Analyze Images or Audio Files
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
