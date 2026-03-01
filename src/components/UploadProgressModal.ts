export const UploadProgressModal = () => `<div
  class="modal-overlay"
  id="upload-modal"
  aria-labelledby="upload-modal-label"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="upload-modal-label">Upload Progress</h5>
        <button type="button" class="btn-close" data-modal-close aria-label="Close">
          <i class="fa-solid fa-times" aria-hidden="true"></i>
        </button>
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
            style="width: 0%"
          ></div>
        </div>
        <p id="upload-progress-text" class="mt-2 text-sm text-muted">0%</p>
      </div>
    </div>
  </div>
</div>`;
