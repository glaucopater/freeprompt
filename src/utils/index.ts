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
