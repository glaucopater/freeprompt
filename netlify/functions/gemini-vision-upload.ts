import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { VISION_PROMPTS } from "./prompts";

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

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

  if (event.body) {
    const { data } = JSON.parse(event.body);
    const imageResp = Buffer.from(data, "base64");
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(imageResp).toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      VISION_PROMPTS[0],
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: result.response.text(),
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
