import { GoogleGenerativeAI } from "@google/generative-ai";
import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { GEMINI_MODELS } from "./models";
import { FileState, GoogleAIFileManager } from "@google/generative-ai/server";
import { AUDIO_PROMPTS } from "./prompts";
// Make sure to include these imports:
// import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const GOOGLE_API_KEY = process.env.NETLIFY_GOOGLE_API_KEY;
const DEFAULT_MODEL = GEMINI_MODELS[0]; // Default to the first model

const mediaPath = "./src/assets/media";

export const handler: Handler = async (event) => {
  console.log("event", event);

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

  // #region

  const fileManager = new GoogleAIFileManager(GOOGLE_API_KEY);

  const uploadResult = await fileManager.uploadFile(`${mediaPath}/sample.mp3`, {
    mimeType: "audio/mp3",
    displayName: "Audio sample",
  });

  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".");
    // Sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    // Fetch the file from the API again
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("Audio processing failed.");
  }

  // View the response.
  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  );

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
  const result = await model.generateContent([
    AUDIO_PROMPTS[0],
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  // #endregion

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: result.response.text(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
