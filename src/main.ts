import "./style.css";
import { updateHealthcheckStatusInterval } from "./setup.ts";

import appDetails from "../package.json";
import logo from "./assets/images/logo-no-bg.png";
import { Footer } from "./components/Footer.ts";
import { Status } from "./components/Status.ts";
import { Header } from "./components/Header.ts";
import { AudioExperiment } from "./components/AudioExperiment.ts";
import { VideoExperiment } from "./components/VideoExperiment.ts";
import { UploadImageCard } from "./components/UploadImageCard.ts";
import { UploadProgressModal } from "./components/UploadProgressModal.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="min-vh-100 d-flex flex-column">
    ${Header(logo)}    
    ${VideoExperiment(UploadImageCard(UploadProgressModal()))}
    ${AudioExperiment()}
    ${Status()}
    ${Footer(appDetails)}
  </div>
`;

updateHealthcheckStatusInterval();
