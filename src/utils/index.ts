import { MAX_FILE_SIZE } from "../constants";
import { AnalysisData } from "../types";

export const parseResponseData = (data: string) => {
  const [description, categories, palette] = data.split("\n\n");

  const responseData = {
    description,
    categories: categories.split(",").map((category) => category.trim()),
    palette: palette.split(",").map((color) => color.trim()),
  } as AnalysisData;

  return responseData;
};

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} bytes`;
  if (size < MAX_FILE_SIZE) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / MAX_FILE_SIZE).toFixed(2)} MB`;
}
