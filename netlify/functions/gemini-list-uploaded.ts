import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { VISION_PROMPTS } from "./prompts";
import { GoogleAIFileManager } from "@google/generative-ai/server";

dotenv.config();

const GOOGLE_API_KEY = process.env.NETLIFY_GOOGLE_API_KEY;
const DEFAULT_MODEL = "models/gemini-1.5-pro";

export const handler: Handler = async (event) => {
  if (!GOOGLE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "API key not configured. Make sure you have a .env file with GOOGLE_API_KEY set.",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  const fileManager = new GoogleAIFileManager(GOOGLE_API_KEY);

  const listFilesResponse = await fileManager.listFiles();

  console.log("listFilesResponse", listFilesResponse);

  const response = Object.entries(listFilesResponse.files).map(
    ([_key, file]) => `name: ${file.name} | display name: ${file.displayName}`
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      files: response,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
