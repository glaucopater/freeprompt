import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { VISION_PROMPTS } from "./prompts";
import { DEFAULT_GEMINI_MODEL } from "./models";

dotenv.config();
const GOOGLE_API_KEY = process.env.NETLIFY_GOOGLE_API_KEY;
const DEFAULT_MODEL = DEFAULT_GEMINI_MODEL;

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

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const selectedModel = event.body ? JSON.parse(event.body).model : DEFAULT_MODEL;
  const model = genAI.getGenerativeModel({ model: selectedModel });

  if (event.body) {
    const startTime = Date.now();
    const { data } = JSON.parse(event.body);
    const imageResp = Buffer.from(data, "base64");
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageResp.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      VISION_PROMPTS[0],
    ]);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: result.response.text(),
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          model: selectedModel
        }
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      error: "No image data provided",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
