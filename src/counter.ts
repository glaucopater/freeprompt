import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}

// import * as bootstrap from "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.esm.min.js";

const FUNCTIONS_PATH = "/.netlify/functions";

export const setupEvents = () => {
  console.log("setupEvents");
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

  /*
  const uploadModal: HTMLElement | null =
    document.getElementById("upload-modal");
*/

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
      if (file.size > 1024 * 1024) {
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
    console.log("analyzeFile", formData);
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
          console.log("response", response);
          response.json().then((data) => {
            responseContent!.innerHTML = data.message;

            if (responseModal) {
              new bootstrap.Modal(responseModal).show();
            }
          });
        });
        // rest of your code
      } else {
        console.error("Error reading file");
      }
    };
  }
  function formatFileSize(size: number) {
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
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
