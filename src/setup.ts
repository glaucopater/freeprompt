import "bootstrap/dist/css/bootstrap.min.css";
import {
  convertWebPToPNGBase64,
  formatFileSize,
  parseAudioResponseData,
  parseVisionResponseData,
} from "./utils";
import { FUNCTIONS_PATH, MAX_FILE_SIZE } from "./constants";
import { ResponseVisionComponent } from "./components/ResponseVisionComponent";
import { ResponseHearingComponent } from "./components/ResponseHearingComponent";

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
  // region Upload Area
  const uploadImageArea: HTMLElement | null =
    document.getElementById("upload-area");

  const fileInput: HTMLInputElement | null = document.getElementById(
    "file-input"
  ) as HTMLInputElement | null;

  const fileInfo: HTMLElement | null = document.getElementById("file-info");

  const uploadButton: HTMLButtonElement = document.getElementById(
    "upload-button"
  )! as HTMLButtonElement;

  const resetButton: HTMLButtonElement = document.getElementById(
    "reset-button"
  )! as HTMLButtonElement;


  const uploadForm: HTMLFormElement | null = document.getElementById(
    "upload-form"
  ) as HTMLFormElement | null;


  const analysisAudioResults: HTMLElement | null = document.getElementById(
    "analysis-audio-results"
  );

  const imagePreview = document.getElementById(
    "image-preview"
  ) as HTMLImageElement;

  const audioPreview = document.getElementById(
    "audio-preview"
  ) as HTMLAudioElement;

  const uploadGuide = document.getElementById("upload-guide") as HTMLElement;

  const autoUploadSwitch = document.getElementById(
    "auto-upload-switch"
  ) as HTMLInputElement;

  function resetForm() {
    if (fileInput) fileInput.value = "";
    if (fileInfo) fileInfo.textContent = "";
    if (uploadButton) uploadButton.disabled = true;

    // Reset image preview
    if (imagePreview) {
      imagePreview.src = "";
      imagePreview.classList.add("d-none");
    }

    // Reset audio preview
    if (audioPreview) {
      audioPreview.src = "";
      audioPreview.classList.add("d-none");
    }

    if (uploadGuide) uploadGuide.classList.remove("d-none");

    // Reset columns with animation
    const uploadColumn = document.getElementById("upload-column");
    const resultsColumn = document.getElementById("results-column");
    const visionResults = document.getElementById("analysis-vision-results");
    const audioResults = document.getElementById("analysis-audio-results");

    // First fade out the content
    if (visionResults) visionResults.classList.remove("fade-in");
    if (audioResults) audioResults.classList.remove("fade-in");

    // After content fades out, collapse the width
    setTimeout(() => {
      if (uploadColumn) {
        uploadColumn.classList.remove("has-results");
      }

      // After width transition, hide the results column
      setTimeout(() => {
        if (resultsColumn) {
          resultsColumn.classList.add("d-none");
        }
        if (visionResults) {
          visionResults.style.display = "none";
          visionResults.innerHTML = "";
        }
        if (audioResults) {
          audioResults.style.display = "none";
          audioResults.innerHTML = "";
        }
      }, 300);
    }, 300);
  }

  resetButton.addEventListener("click", resetForm);

  uploadImageArea?.addEventListener("click", () => {
    fileInput?.click();
  });

  uploadImageArea?.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadImageArea?.classList.add("upload-area-dragover");
    uploadImageArea?.classList.remove("upload-area-default");
  });

  uploadImageArea?.addEventListener("dragleave", () => {
    uploadImageArea?.classList.add("upload-area-default");
    uploadImageArea?.classList.remove("upload-area-dragover");
  });

  uploadImageArea?.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadImageArea?.classList.add("upload-area-default");
    uploadImageArea?.classList.remove("upload-area-dragover");

    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      const file = dt.files[0];

      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (fileInput) {
        fileInput.files = dataTransfer.files;
        handleImageFiles(dataTransfer.files);
      }
    }
  });

  fileInput?.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      handleImageFiles(input.files);
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
    // endregion Upload Area

    // region audio

    const triggerAudioTranscriptionButton = document.getElementById(
      "trigger-audio-transcription-button"
    ) as HTMLButtonElement | null;

    triggerAudioTranscriptionButton?.addEventListener("click", async () => {
      const response = await fetch(`${FUNCTIONS_PATH}/gemini-hearing-upload`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const analysisAudioData = data.message;
      console.log("Raw Response:", data.message);

      if (analysisAudioResults) {
        analysisAudioResults.style.display = "block";
        analysisAudioResults.innerHTML = "";
        const parsedData = parseAudioResponseData(analysisAudioData);
        console.log("Parsed Data:", parsedData);
        analysisAudioResults.append(Object.entries(parsedData).join("\n"));
      }

      const responseList = await fetch(
        `${FUNCTIONS_PATH}/gemini-list-uploaded`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const listData = await responseList.json();
      console.log("Raw Response List:", listData.files);
    });

    // endregion audio
  }

  function handleImageFiles(files: FileList | null) {
    if (!files?.length) return;

    // Reset previews first
    if (imagePreview) {
      imagePreview.src = "";
      imagePreview.classList.add("d-none");
    }
    if (audioPreview) {
      audioPreview.src = "";
      audioPreview.classList.add("d-none");
    }

    const file = files[0];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac", "m4a", "aac"];

    const allowedExtensions = [...imageExtensions, ...audioExtensions];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (
      allowedExtensions.includes(fileExtension) ||
      file.type.startsWith("image/") ||
      file.type.startsWith("audio/")
    ) {
      if (file.size > MAX_FILE_SIZE) {
        fileInfo!.textContent = `File size exceeds ${MAX_FILE_SIZE} bytes`;
        uploadButton!.disabled = true;
        uploadGuide.classList.remove("d-none");
      } else {
        fileInfo!.textContent = `File: ${file.name} (${formatFileSize(
          file.size
        )})`;
        uploadButton!.disabled = false;

        const reader = new FileReader();
        reader.onload = async (e) => {
          if (!e.target?.result) return;

          if (file.type.startsWith("image/")) {
            if (imagePreview) {
              if (file.type === "image/webp") {
                const pngBase64 = await convertWebPToPNGBase64(
                  e.target.result as string
                );
                imagePreview.src = pngBase64 as string;
              } else {
                imagePreview.src = e.target.result as string;
              }
              imagePreview.classList.remove("d-none");
            }
          } else if (file.type.startsWith("audio/")) {
            if (audioPreview) {
              audioPreview.src = e.target.result as string;
              audioPreview.classList.remove("d-none");
            }
          }

          if (uploadGuide) {
            uploadGuide.classList.add("d-none");
          }
        };
        reader.readAsDataURL(file);

        // Auto upload if enabled
        if (autoUploadSwitch?.checked) {
          analyzeFile(file);
        }
      }
    } else {
      fileInfo!.textContent = "Only image or audio files are allowed";
      uploadButton!.disabled = true;
      uploadGuide.classList.remove("d-none");
    }
  }

  async function analyzeFile(file: Blob) {
    const visionResultsContainer = document.getElementById("analysis-vision-results");
    const audioResultsContainer = document.getElementById("analysis-audio-results");
    const uploadColumn = document.getElementById("upload-column");
    const resultsColumn = document.getElementById("results-column");

    // Hide both containers initially
    if (visionResultsContainer) visionResultsContainer.style.display = "none";
    if (audioResultsContainer) audioResultsContainer.style.display = "none";

    // Select the appropriate container based on file type
    const resultsContainer = file.type.startsWith("image/")
      ? visionResultsContainer
      : audioResultsContainer;

    if (resultsContainer) {
      // Show results column with animation
      if (resultsColumn) {
        resultsColumn.classList.remove("d-none");
      }
      if (uploadColumn) {
        // Trigger reflow to ensure animation works
        void uploadColumn.offsetWidth;
        uploadColumn.classList.add("has-results");
      }

      // Wait for width transition before showing content
      setTimeout(() => {
        resultsContainer.style.display = "block";
        resultsContainer.innerHTML = "";
        resultsContainer.append(file.type.startsWith("image/")
          ? ResponseVisionComponent(null)
          : ResponseHearingComponent(null));

        // Trigger fade in
        setTimeout(() => {
          resultsContainer.classList.add("fade-in");
        }, 50);
      }, 300);
    }

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
      });

      const modelSelect = document.getElementById("model-select") as HTMLSelectElement;
      const selectedModel = modelSelect.value;

      if (file.type.startsWith("image/")) {
        const response = await fetch(`${FUNCTIONS_PATH}/gemini-vision-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: base64,
            model: selectedModel
          }),
        });

        const data = await response.json();
        const analysisVisionData = parseVisionResponseData(data.message, data.metadata);

        if (resultsContainer) {
          resultsContainer.innerHTML = "";
          resultsContainer.append(ResponseVisionComponent(analysisVisionData));
          resultsContainer.classList.add("fade-in");
        }
      } else if (file.type.startsWith("audio/")) {
        const response = await fetch(`${FUNCTIONS_PATH}/gemini-hearing-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: base64,
            model: selectedModel
          }),
        });

        const data = await response.json();
        const analysisAudioData = parseAudioResponseData(data.message, data.metadata);

        if (resultsContainer) {
          resultsContainer.innerHTML = "";
          const audioUrl = URL.createObjectURL(file);
          resultsContainer.append(ResponseHearingComponent(analysisAudioData, audioUrl));
          resultsContainer.classList.add("fade-in");
        }
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      if (resultsContainer) {
        resultsContainer.innerHTML = "";
        const errorSection = document.createElement("div");
        errorSection.className = "card shadow-sm bg-white rounded-3 p-4";
        const errorBody = document.createElement("div");
        errorBody.className = "text-danger text-center py-4";
        errorBody.textContent = "Error analyzing file. Please try again.";
        errorSection.append(errorBody);
        resultsContainer.append(errorSection);
        resultsContainer.classList.add("fade-in");
      }
    } finally {
      if (uploadButton) uploadButton.disabled = false;
    }
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
