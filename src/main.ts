import "./style.css";
import { updateHealthcheckStatusInterval, setupEvents } from "./setup.ts";

import appDetails from "../package.json";
import logo from "./assets/images/logo-no-bg.png";
import { Footer } from "./components/Footer.ts";
import { Status } from "./components/Status.ts";
import { Header } from "./components/Header.ts";
import { VisionExperiment } from "./components/VideoExperiment.ts";
import { UploadFilesCard } from "./components/UploadImageCard.ts";
import { UploadProgressModal } from "./components/UploadProgressModal.ts";
import { GenerateMediaCard } from "./components/GenerateMediaCard.ts";

const isMediaGeneratorEnabled =
  import.meta.env.VITE_ENABLE_MEDIA_GENERATOR === "true";

const mediaGeneratorTab = isMediaGeneratorEnabled
  ? `
 <li class="nav-item" role="presentation">
    <button class="nav-link" id="generate-tab" data-bs-toggle="tab" data-bs-target="#generate-tab-pane" type="button" role="tab" aria-controls="generate-tab-pane" aria-selected="false">Generate Image</button>
 </li>`
  : "";

const mediaGeneratorContent = isMediaGeneratorEnabled
  ? `<div class="tab-pane" id="generate-tab-pane" role="tabpanel" aria-labelledby="generate-tab" tabindex="0">'
    ${GenerateMediaCard()}
  </div>`
  : "";

function renderShareTargetContent() {
  return `
    <div class="container mt-4">
      <h2>Content Received</h2>
      <p>Your shared content has been received and is being processed.</p>
      <p>Please check the Netlify Function logs for details.</p>
    </div>
  `;
}

// Helper function to convert base64 to Blob
function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

const appDiv = document.querySelector<HTMLDivElement>("#app")!;

// Render the main app structure first
appDiv.innerHTML = `
  <div class="min-vh-100 d-flex flex-column">
    ${Header(logo)}
    <div class="container mt-4">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="analyze-tab" data-bs-toggle="tab" data-bs-target="#analyze-tab-pane" type="button" role="tab" aria-controls="analyze-tab-pane" aria-selected="true">Analyze Media</button>
        </li>
         ${mediaGeneratorTab}           
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane show active" id="analyze-tab-pane" role="tabpanel" aria-labelledby="analyze-tab" tabindex="0">
          ${VisionExperiment(UploadFilesCard(UploadProgressModal()))}
        </div>
        ${mediaGeneratorContent}      
      </div>
    </div>

    ${Status()}
    ${Footer(appDetails)}
  </div>
`;

// Handle shared content after the DOM is rendered
const urlParams = new URLSearchParams(window.location.search);
const sharedImageBase64 = urlParams.get("sharedImage");
const sharedFilename = urlParams.get("filename");
const sharedMimetype = urlParams.get("mimetype");

const sharedAudioBase64 = urlParams.get("sharedAudio");
const sharedAudioFilename = urlParams.get("filename"); // Filename is generic
const sharedAudioMimetype = urlParams.get("mimetype"); // Mimetype is generic

if (sharedImageBase64 && sharedFilename && sharedMimetype) {
  console.warn("Shared image detected in URL parameters.");
  const imageBlob = b64toBlob(sharedImageBase64, sharedMimetype);
  const imageFile = new File([imageBlob], sharedFilename, { type: sharedMimetype });

  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  if (fileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(imageFile);
    fileInput.files = dataTransfer.files;

    // Dispatch a change event to trigger existing listeners
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.warn("Shared image programmatically added to file input.");
  } else {
    console.error("File input element not found.");
  }
  // Clean up the URL after processing
  history.replaceState({}, document.title, window.location.pathname);
} else if (sharedAudioBase64 && sharedAudioFilename && sharedAudioMimetype) {
  console.warn("Shared audio detected in URL parameters.");
  const audioBlob = b64toBlob(sharedAudioBase64, sharedAudioMimetype);
  const audioFile = new File([audioBlob], sharedAudioFilename, { type: sharedAudioMimetype });

  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  if (fileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(audioFile);
    fileInput.files = dataTransfer.files;

    // Dispatch a change event to trigger existing listeners
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.warn("Shared audio programmatically added to file input.");
  } else {
    console.error("File input element not found.");
  }
  // Clean up the URL after processing
  history.replaceState({}, document.title, window.location.pathname);
} else if (window.location.pathname === "/share-target/") {
  // This block handles the case where the share target was hit, but no sharedImage/Audio param was found
  // (e.g., if the Netlify function redirected without an image/audio, or if it was a text share)
  appDiv.innerHTML = `
    <div class="min-vh-100 d-flex flex-column">
      ${Header(logo)}
      ${renderShareTargetContent()}
      ${Status()}
      ${Footer(appDetails)}
    </div>
  `;
  history.replaceState({}, document.title, "/");
}


// Log page layout info on load to help debug layout issues
import { inspectPageLayout } from './utils/browser-logger.ts';
window.addEventListener('load', () => {
  const layout = inspectPageLayout();
  console.info('Page layout info:', layout);
  
  // Check if html has 0 height (common issue)
  if (layout.html && typeof layout.html === 'object' && 'dimensions' in layout.html) {
    const htmlDims = layout.html.dimensions as { height?: string };
    if (htmlDims?.height === '0px') {
      console.warn('⚠️ HTML element has height 0px - this may cause layout issues');
    }
  }
});

setupEvents();
updateHealthcheckStatusInterval();