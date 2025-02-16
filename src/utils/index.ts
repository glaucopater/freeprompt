import { MAX_FILE_SIZE } from "../constants";
import { AnalysisVisionData } from "../types";

export const parseVisionResponseData = (data: string) => {
  // replace multiple times "\n\n" with "\n"
  const filteredData = data.replace(/\n+/g, "\n");
  const [descriptionRaw, categoriesRaw, paletteRaw] = filteredData.split("\n");

  const responseData = {
    description: descriptionRaw,
    categories: categoriesRaw.split(",").map((category) => category.trim()),
    palette: paletteRaw.split(",").map((color) => color.trim()),
  } as AnalysisVisionData;

  return responseData;
};

export const parseAudioResponseData = (data: string) => {
  const responseData = data.replace("\n\n", "");

  return responseData;
};

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} bytes`;
  if (size < MAX_FILE_SIZE) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / MAX_FILE_SIZE).toFixed(2)} MB`;
}

export const convertWebPToPNGBase64 = (webpBase64: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Failed to get 2D context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = webpBase64;
  });
};
