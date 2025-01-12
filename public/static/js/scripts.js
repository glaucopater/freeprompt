const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const fileInfo = document.getElementById("file-info");
const uploadButton = document.getElementById("upload-button");
const spinner = document.getElementById("spinner");
const uploadForm = document.getElementById("upload-form");
const uploadModal = document.getElementById("upload-modal");
const uploadProgress = document.getElementById("upload-progress");
const uploadProgressText = document.getElementById("upload-progress-text");
const responseModal = document.getElementById("response-modal");
const responseContent = document.getElementById("response-content");

uploadArea.addEventListener("click", () => {
  fileInput.click();
});

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.style.border = "2px dashed #aaa";
  uploadArea.style.background = "#ddd";
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.style.border = "2px dashed #ccc";
  uploadArea.style.background = "#f0f0f0";
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.style.border = "2px dashed #ccc";
  uploadArea.style.background = "#f0f0f0";
  const files = e.dataTransfer.files;
  handleFiles(files);
});

fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  handleFiles(files);
});

uploadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const file = formData.get("file");

  analyzeFile(file);
});

function handleFiles(files) {
  if (files.length === 0) return;
  const file = files[0];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (
    imageExtensions.includes(fileExtension) ||
    file.type.startsWith("image/")
  ) {
    if (file.size > 1024 * 1024) {
      fileInfo.textContent = "File size exceeds 1MB";
      uploadButton.disabled = true;
    } else {
      fileInfo.textContent = `File: ${file.name} (${formatFileSize(
        file.size
      )})`;
      uploadButton.disabled = false;
    }
  } else {
    fileInfo.textContent = "Only image files are allowed";
    uploadButton.disabled = true;
  }
}

async function analyzeFile(formData) {
  const reader = new FileReader();
  reader.readAsDataURL(formData);
  reader.onload = async function () {
    const base64 = reader.result.split(",")[1];
    console.log(base64);
    // pass formData to the fetch
    const response = await fetch("/.netlify/functions/gemini-vision-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: base64 }),
    }).then((response) => {
      // should resolve the promise and show the json result in the modal
      response.json().then((data) => {
        responseContent.innerHTML = data.message;
        new bootstrap.Modal(responseModal).show();
      });
    });
  };
}

function uploadFile(formData) {
  spinner.style.display = "block";
  const uploadButton = document.getElementById("upload-button");
  uploadButton.disabled = true;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload-and-analyze", true);
  xhr.upload.addEventListener("progress", (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    uploadProgress.style.width = `${percent}%`;
    uploadProgressText.textContent = `${percent}%`;
    uploadModal.style.display = "block";
  });
  xhr.addEventListener("load", () => {
    spinner.style.display = "none";
    uploadButton.disabled = false;
    uploadModal.style.display = "none";
    responseContent.innerHTML = xhr.responseText;
    new bootstrap.Modal(responseModal).show();
  });
  xhr.send(formData);
}

function formatFileSize(size) {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

responseModal.addEventListener("hidden.bs.modal", () => {
  resetForm();
});

function resetForm() {
  uploadArea.style.border = "2px dashed #ccc";
  uploadArea.style.background = "#f0f0f0";
  fileInfo.textContent = "";
  uploadButton.disabled = true;
  spinner.style.display = "none";
  fileInput.value = "";
  uploadProgress.style.width = "0%";
  uploadProgressText.textContent = "0%";
}
