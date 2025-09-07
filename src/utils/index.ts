import { MAX_FILE_SIZE } from "../constants";
import { AnalysisVisionData } from "../types";

import { EnhancedGenerateContentResponse } from "@google/generative-ai";

export const parseVisionResponseData = (data: string, metadata?: { processingTime: number, model: string, imageStats: { originalSize: number, resizedSize: number, originalWidth?: number, originalHeight?: number, originalAspectRatio?: number, resizedWidth?: number, resizedHeight?: number, resizedAspectRatio?: number } }) => {
  // replace multiple times "\n\n" with "\n"  
  const filteredData = data.replace(/\n+/g, "\n");
  const [descriptionRaw, categoriesRaw, paletteRaw] = filteredData.split("\n");
  const responseData = { description: descriptionRaw, categories: categoriesRaw.split(",").map((category) => category.trim()), palette: paletteRaw.split(",").map((color) => color.trim()), processingTime: metadata?.processingTime || 0, model: metadata?.model || "Unknown", imageStats: metadata?.imageStats } as AnalysisVisionData;
  return responseData;
};

export const parseAudioResponseData = (data: string | null, metadata?: { processingTime: number, model: string }) => {
  if (!data) {
    return {
      transcript: "",
      language: "Unknown",
      translation: "",
      processingTime: metadata?.processingTime || 0,
      model: metadata?.model || "Unknown"
    };
  }

  const responseData = data.replace(/\n+/g, "\n");
  const parsedItems = responseData.split("\n");

  // Helper function to clean markdown-style formatting
  const cleanFormatting = (text: string) => {
    return text
      .replace(/^\*\*[^:]+:\*\*\s*/, '') // Remove **Label:** pattern
      .replace(/^[^:]+:\s*/, ''); // Remove Label: pattern
  };

  if (parsedItems.length < 3) {
    console.warn("Error parsing audio response data");
    return {
      transcript: cleanFormatting(parsedItems[0] || ""),
      language: "English",
      translation: "",
      processingTime: metadata?.processingTime || 0,
      model: metadata?.model || "Unknown"
    };
  }

  // to cover the case when the LLM is adding "Okay, here is the transcript, language, and translation:"
  if (parsedItems.length > 3 && parsedItems[parsedItems.length - 1] !== "") {
    return {
      transcript: cleanFormatting(parsedItems[1] || ""),
      language: cleanFormatting(parsedItems[2] || "Unknown"),
      translation: cleanFormatting(parsedItems[3] || ""),
      processingTime: metadata?.processingTime || 0,
      model: metadata?.model || "Unknown"
    };
  }

  const [transcript, language, translation] = parsedItems;
  return {
    transcript: cleanFormatting(transcript || ""),
    language: cleanFormatting(language || "Unknown"),
    translation: cleanFormatting(translation || ""),
    processingTime: metadata?.processingTime || 0,
    model: metadata?.model || "Unknown"
  };
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


export const getTitleAndDescriptionWithTextResponse = (message: any) => {
  let title = "Generated Media";
  let description = " -";
  const regex = /\*\*Title:\*\*\s*(?<title>.+?)\s*\n*\s*\*\*Description:\*\*\s*(?<description>.+)/s;
  const match = message.match(regex);

  if (match && match?.groups) {
    title = match.groups.title;
    description = match.groups.description;
  }
  else {
    console.log("No title/description match found");
  }

  return { title, description }

};
