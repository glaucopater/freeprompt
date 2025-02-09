import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { AUDIO_PROMPTS } from "./prompts";
import { GEMINI_MODELS } from "./models";
// Make sure to include these imports:
dotenv.config();

const GOOGLE_API_KEY = process.env.NETLIFY_GOOGLE_API_KEY;

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

  // #region inline upload

  if (event.body) {
    const { data } = JSON.parse(event.body);
    const imageResp = Buffer.from(data, "base64");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    // Initialize a Gemini model appropriate for your use case.
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODELS[2],
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageResp.toString("base64"),
          mimeType: "audio/mp3",
        },
      },
      AUDIO_PROMPTS[1],
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
