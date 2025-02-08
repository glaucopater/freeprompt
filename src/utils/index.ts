import { MAX_FILE_SIZE } from "../constants";
import { AnalysisVisionData } from "../types";

export const parseVisionResponseData = (data: string) => {
  const [description, categories, palette] = data.split("\n\n");

  const responseData = {
    description,
    categories: categories.split(",").map((category) => category.trim()),
    palette: palette.split(",").map((color) => color.trim()),
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
