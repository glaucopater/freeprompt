import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { DEFAULT_GEMINI_MODEL, IMAGE_GENERATION_MODELS } from "./models";
import { logToFile } from "./utils";

dotenv.config();
const GOOGLE_API_KEY = process.env.NETLIFY_GOOGLE_API_KEY;
const DEFAULT_MODEL = DEFAULT_GEMINI_MODEL;

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  const requestPayload = {
    model: event.body ? JSON.parse(event.body).model : DEFAULT_MODEL,
    prompt: event.body ? JSON.parse(event.body).prompt : "A simple generated image",
  };
  const { model: selectedModel, prompt } = requestPayload;

  // Use explicit IMAGE_GENERATION_MODELS list from models.ts (fallback to DEFAULT_MODEL)
  const imageModels = IMAGE_GENERATION_MODELS.slice(0, 2);
  const allowedModel = imageModels.includes(selectedModel as string) ? (selectedModel as string) : (imageModels[0] || DEFAULT_MODEL);

  if (!GOOGLE_API_KEY) {
    const errorBody = { error: "API key not configured. Set NETLIFY_GOOGLE_API_KEY." };
    logToFile({ request: requestPayload, response: errorBody });
    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
      headers,
    };
  }

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY as string);

  try {
    const model = genAI.getGenerativeModel({ model: allowedModel as string });

    const result = await model.generateContent([prompt as string]);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    let dataUri: string | null = null;
    let title: string | null = null;
    let description: string | null = null;
    let message: string = "";

    const imagePart = parts.find(part => part.inlineData);
    if (imagePart && imagePart.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      dataUri = `data:${mimeType};base64,${data}`;
    }

    const textParts = parts.filter(part => part.text).map(part => part.text);
    const combinedText = textParts.join('\n');

    if (combinedText) {
      message = combinedText;
      const titleMatch = combinedText.match(/Title: (.*)/);
      if (titleMatch) {
        title = titleMatch[1];
      }
      const descMatch = combinedText.match(/Description: ([\s\S]*)/);
      if (descMatch) {
        description = descMatch[1].trim();
      }
    }


    const regex = /\*\*Title:\*\*\s*(?<title>.+?)\s*\n+\s*\*\*Description:\*\*\s*(?<description>.+)/s;
    const match = combinedText.match(regex);

    if (match && match.groups) {
      const title = match.groups.title;
      const description = match.groups.description;
      console.warn({ title, description });
    }

    const responseBody = {
      dataUri,
      title,
      description,
      message,
      metadata: { model: allowedModel, mocked: false, timestamp: new Date().toISOString() },
    };

    logToFile({ request: requestPayload, response: responseBody, geminiResult: result });

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      headers,
    };
  } catch (err: unknown) {
    // Detect quota / rate limit errors and return 429 with retry info when possible
    const message = err?.message || String(err);
    const isQuotaError = /Too Many Requests|exceeded your current quota|QuotaFailure/i.test(message);
    const isModelNotFound = /not found for API version|is not found for API version|not found/i.test(message);

    // try to extract retry delay in seconds from message (e.g. 'retryDelay":"39s' or 'RetryInfo","retryDelay":"39s')
    let retrySeconds: number | undefined;
    try {
      const m = message.match(/("retryDelay"|retryDelay)\s*[:=]\s*\??"?(\d+)s/);
      if (m && m[2]) retrySeconds = parseInt(m[2], 10);
      else {
        const m2 = message.match(/(\d+)s/);
        if (m2) retrySeconds = parseInt(m2[1], 10);
      }
    } catch {
      // ignore parse errors
    }

    if (isQuotaError) {
      const errorBody = {
        error: message,
        retryAfterSeconds: retrySeconds,
        metadata: { model: allowedModel, mocked: true, quotaExceeded: true, timestamp: new Date().toISOString() },
      };
      logToFile({ request: requestPayload, error: err, response: errorBody });
      return {
        statusCode: 429,
        body: JSON.stringify(errorBody),
        headers,
      };
    }

    if (isModelNotFound) {
      // Try to list available models so the client can inspect supported models/methods
      try {
        // Call REST models list endpoint to return available models
        const modelsResp = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
          headers: {
            Authorization: `Bearer ${GOOGLE_API_KEY}`,
            "Content-Type": "application/json",
          },
        });
        const modelsJson = await modelsResp.json();
        // Log the models list to the function console for inspection
        console.warn('Available models from API:', JSON.stringify(modelsJson, null, 2));
        const errorBody = {
          error: message,
          models: modelsJson,
          metadata: { attemptedModel: allowedModel, timestamp: new Date().toISOString() },
        };
        logToFile({ request: requestPayload, error: err, response: errorBody });
        return {
          statusCode: 404,
          body: JSON.stringify(errorBody),
          headers,
        };
      } catch (listErr: unknown) {
        const errorBody = { error: message, listError: (listErr instanceof Error ? listErr.message : String(listErr)) };
        logToFile({ request: requestPayload, error: err, response: errorBody });
        return {
          statusCode: 500,
          body: JSON.stringify(errorBody),
          headers,
        };
      }
    }

    const errorBody = { error: message };
    logToFile({ request: requestPayload, error: err, response: errorBody });
    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
      headers,
    };
  }
};
