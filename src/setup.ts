import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

const FUNCTIONS_PATH = "/.netlify/functions";
const MAX_FILE_SIZE = 1024 * 1024;

/**
 * Set up all the event listeners for the page.
 *
 * Adds event listeners to the upload area, file input, upload button, and
 * form. These event listeners handle drag and drop events, file input
 * changes, form submissions, and modal close events.
 *
 * When a file is selected, it is analyzed by sending a POST request to the
 * Netlify function at /.netlify/functions/gemini-vision-upload. The function
 * returns a JSON object with a "message" property, which is displayed in the
 * modal.
 *
 * The modal is also cleared when it is closed.
 */

export const setupEvents = () => {
  const uploadArea: HTMLElement | null = document.getElementById("upload-area");

  const fileInput: HTMLInputElement | null = document.getElementById(
    "file-input"
  ) as HTMLInputElement | null;

  const fileInfo: HTMLElement | null = document.getElementById("file-info");

  const uploadButton: HTMLButtonElement = document.getElementById(
    "upload-button"
  )! as HTMLButtonElement;

  const spinner: HTMLElement | null = document.getElementById("spinner");

  const uploadForm: HTMLFormElement | null = document.getElementById(
    "upload-form"
  ) as HTMLFormElement | null;

  const uploadProgress: HTMLElement | null =
    document.getElementById("upload-progress");
  const uploadProgressText: HTMLElement | null = document.getElementById(
    "upload-progress-text"
  );
  const responseModal: HTMLElement | null =
    document.getElementById("response-modal");
  const responseContent: HTMLElement | null =
    document.getElementById("response-content");

  uploadArea?.addEventListener("click", () => {
    fileInput?.click();
  });

  uploadArea?.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea?.classList.add("upload-area-dragover");
    uploadArea?.classList.remove("upload-area-default");
  });

  uploadArea?.addEventListener("dragleave", () => {
    uploadArea?.classList.add("upload-area-default");
    uploadArea?.classList.remove("upload-area-dragover");
  });

  uploadArea?.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea?.classList.add("upload-area-default");
    uploadArea?.classList.remove("upload-area-dragover");
    const files = e.dataTransfer?.files;
    handleFiles(files);
  });

  fileInput?.addEventListener("change", () => {
    const files = fileInput?.files;
    handleFiles(files);
  });

  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(uploadForm);
      const file = formData.get("file");

      if (!file) {
        return;
      } else {
        analyzeFile(file as Blob);
      }
    });
  }

  function handleFiles(files: string | any[] | FileList | null | undefined) {
    if (files === null || files === undefined) return;
    if (files.length === 0) return;
    const file = files[0];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    const fileExtension: string = file.name.split(".").pop().toLowerCase();
    if (
      imageExtensions.includes(fileExtension) ||
      file.type.startsWith("image/")
    ) {
      if (file.size > MAX_FILE_SIZE) {
        fileInfo!.textContent = "File size exceeds 1MB";
        uploadButton!.disabled = true;
      } else {
        fileInfo!.textContent = `File: ${file.name} (${formatFileSize(
          file.size
        )})`;
        uploadButton!.disabled = false;
      }
    } else {
      fileInfo!.textContent = "Only image files are allowed";
      uploadButton!.disabled = true;
    }
  }

  async function analyzeFile(formData: Blob) {
    const reader = new FileReader();
    reader.readAsDataURL(formData);
    reader.onload = async function () {
      if (reader.result !== null) {
        const base64 = (reader.result as string).split(",")[1];
        // pass formData to the fetch
        await fetch(`${FUNCTIONS_PATH}/gemini-vision-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: base64 }),
        }).then((response) => {
          // should resolve the promise and show the json result in the modal
          response.json().then((data) => {
            responseContent!.innerHTML = data.message;

            if (responseModal) {
              new bootstrap.Modal(responseModal).show();
            }
          });
        });
      } else {
        console.error("Error reading file");
      }
    };
  }
  function formatFileSize(size: number) {
    if (size < 1024) return `${size} bytes`;
    if (size < MAX_FILE_SIZE) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / MAX_FILE_SIZE).toFixed(2)} MB`;
  }

  responseModal!.addEventListener("hidden.bs.modal", () => {
    resetForm();
  });

  function resetForm() {
    uploadArea!.style.border = "2px dashed #ccc";
    uploadArea!.style.background = "#f0f0f0";
    fileInfo!.textContent = "";
    uploadButton!.disabled = true;
    spinner!.style.display = "none";
    fileInput!.value = "";
    uploadProgress!.style.width = "0%";
    uploadProgressText!.textContent = "0%";
  }
};

async function updateHealthcheckStatus() {
  await fetch(`${FUNCTIONS_PATH}/healthcheck`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (response.status === 200) {
      setupEvents();

      document.getElementById("healthcheck-status")!.textContent = "🟢";
    } else {
      document.getElementById("healthcheck-status")!.textContent = "🔴";
    }
  });
}

export async function updateHealthcheckStatusInterval() {
  while (true) {
    await updateHealthcheckStatus();
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000 * 5));
  }
}
