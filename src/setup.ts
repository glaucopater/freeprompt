import "bootstrap/dist/css/bootstrap.min.css";
import { ResponseComponent } from "./components/ResponseComponent";
import { parseResponseData } from "./utils";
import { AnalysisData } from "./types";

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

  const analysisResults: HTMLElement | null =
    document.getElementById("analysis-results");

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
    e.stopPropagation();
    uploadArea?.classList.add("upload-area-default");
    uploadArea?.classList.remove("upload-area-dragover");

    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      const file = dt.files[0];

      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (fileInput) {
        fileInput.files = dataTransfer.files;
        handleFiles(dataTransfer.files);
      }
    }
  });

  fileInput?.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      handleFiles(input.files);
    }
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

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const imagePreview = document.getElementById(
      "image-preview"
    ) as HTMLImageElement;
    const autoUploadSwitch = document.getElementById(
      "auto-upload-switch"
    ) as HTMLInputElement;

    if (
      imageExtensions.includes(fileExtension) ||
      file.type.startsWith("image/")
    ) {
      if (file.size > MAX_FILE_SIZE) {
        fileInfo!.textContent = "File size exceeds 1MB";
        uploadButton!.disabled = true;
        imagePreview.classList.add("d-none");
      } else {
        fileInfo!.textContent = `File: ${file.name} (${formatFileSize(
          file.size
        )})`;
        uploadButton!.disabled = false;

        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (imagePreview && e.target?.result) {
            imagePreview.src = e.target.result as string;
            imagePreview.classList.remove("d-none");
          }
        };
        reader.readAsDataURL(file);

        // Auto upload if enabled
        if (autoUploadSwitch?.checked) {
          analyzeFile(file);
        }
      }
    } else {
      fileInfo!.textContent = "Only image files are allowed";
      uploadButton!.disabled = true;
      imagePreview.classList.add("d-none");
    }
  }

  async function analyzeFile(file: Blob) {
    if (spinner) spinner.style.display = "block";
    if (uploadButton) uploadButton.disabled = true;

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (reader.result !== null) {
            resolve((reader.result as string).split(",")[1]);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(reader.error);
      });

      const response = await fetch(`${FUNCTIONS_PATH}/gemini-vision-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: base64 }),
      });

      const data = await response.json();
      const analysisData: AnalysisData = parseResponseData(data.message);
      console.log("Raw Response:", data.message);

      if (analysisResults) {
        analysisResults.style.display = "block";
        analysisResults.innerHTML = "";
        analysisResults.append(ResponseComponent(analysisData));
      }
    } catch (error) {
      console.error("Analysis error:", error);
      if (fileInfo)
        fileInfo.textContent = "Error analyzing image. Please try again.";
    } finally {
      if (spinner) spinner.style.display = "none";
      if (uploadButton) uploadButton.disabled = false;
    }
  }
  function formatFileSize(size: number) {
    if (size < 1024) return `${size} bytes`;
    if (size < MAX_FILE_SIZE) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / MAX_FILE_SIZE).toFixed(2)} MB`;
  }
};

async function updateHealthcheckStatus() {
  try {
    const response = await fetch(`${FUNCTIONS_PATH}/healthcheck`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const healthStatus = document.getElementById("healthcheck-status");
    if (!healthStatus) return;

    if (response.status === 200) {
      healthStatus.textContent = "🟢";
      setupEvents();
    } else {
      healthStatus.textContent = "🔴";
    }
  } catch (error) {
    console.error("Healthcheck error:", error);
    const healthStatus = document.getElementById("healthcheck-status");
    if (healthStatus) healthStatus.textContent = "🔴";
  }
}

export async function updateHealthcheckStatusInterval() {
  while (true) {
    await updateHealthcheckStatus();
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000 * 5));
  }
}
