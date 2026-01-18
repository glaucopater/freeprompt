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

  if (event.body) {
    try {
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const parsedBody = JSON.parse(event.body);
      const selectedModel = parsedBody.model || DEFAULT_MODEL;
      const model = genAI.getGenerativeModel({ model: selectedModel });
      
      const startTime = Date.now();
      const { data, mimeType } = parsedBody;
      const imageResp = Buffer.from(data, "base64");
      
      // Use provided mimeType or default to jpeg
      // Gemini supports: image/png, image/jpeg, image/webp, image/heic, image/heif
      const actualMimeType = mimeType || "image/jpeg";
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageResp.toString("base64"),
            mimeType: actualMimeType,
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
    } catch (error) {
      console.error("Error analyzing image:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for rate limit / quota exhausted errors from Gemini API
      const isRateLimited = 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('429') ||
        errorMessage.includes('Too Many Requests');
      
      if (isRateLimited) {
        return {
          statusCode: 429,
          body: JSON.stringify({
            error: "Rate limit exceeded",
            errorType: "RATE_LIMIT",
            details: "Daily API quota exhausted. Please try again tomorrow.",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to analyze image",
          errorType: "SERVER_ERROR",
          details: errorMessage,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
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
