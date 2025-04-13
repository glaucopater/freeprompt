import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { AUDIO_PROMPTS } from "./prompts";

import { DEFAULT_GEMINI_MODEL } from "./models";

// Make sure to include these imports:
dotenv.config();

const GOOGLE_API_KEY = process.env.NETLIFY_GOOGLE_API_KEY;

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*", // Allow any origin
    "Access-Control-Allow-Headers": "Content-Type", // Allow the Content-Type header
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow GET, POST, and OPTIONS methods
    "Content-Type": "application/json",
  };

  if (!GOOGLE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "API key not configured. Make sure you have a .env file with GOOGLE_API_KEY set.",
      }),
      headers,
    };
  }

  if (event.httpMethod === "OPTIONS") {
    // Handle pre-flight request
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call." }),
    };
  }
  // #region inline upload

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const selectedModel = event.body ? JSON.parse(event.body).model : DEFAULT_GEMINI_MODEL;
  const model = genAI.getGenerativeModel({ model: selectedModel });

  if (event.body) {
    const startTime = Date.now();
    const { data } = JSON.parse(event.body);
    const audioResp = Buffer.from(data, "base64");
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(audioResp).toString("base64"),
          mimeType: "audio/mpeg",
        },
      },
      AUDIO_PROMPTS[1],
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

  //  #endregion

  return {
    statusCode: 401,
    body: JSON.stringify({
      message: "Audio processing failed.",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
