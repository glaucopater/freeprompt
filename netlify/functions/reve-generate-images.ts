import { Handler } from "@netlify/functions";
import * as dotenv from "dotenv";
import { logToFile } from "./utils";

dotenv.config();
const REVE_API_KEY = process.env.NETLIFY_REVE_API_KEY;

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

  const body = event.body ? JSON.parse(event.body) : {};
  const requestPayload = {
    prompt: body.prompt || "A simple generated image",
    aspect_ratio: "16:9",
    version: "latest",
  };
  const acceptHeader = body.type || "application/json";

  if (!REVE_API_KEY) {
    const errorBody = {
      error: "API key not configured. Set NETLIFY_REVE_API_KEY.",
    };
    logToFile({ request: requestPayload, response: errorBody });
    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
      headers,
    };
  }

  try {
    const payloadString = JSON.stringify(requestPayload);

    const reveResponse = await fetch("https://api.reve.com/v1/image/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REVE_API_KEY}`,
        Accept: acceptHeader,
      },
      body: payloadString,
    });

    console.warn(
      "Reve AI Response Status:",
      reveResponse.status,
      reveResponse.statusText
    );

    if (!reveResponse.ok) {
      const errorText = await reveResponse.text();
      console.error("Error from Reve AI:", reveResponse.status, errorText);
      throw new Error(`Reve AI API error: ${reveResponse.status} ${errorText}`);
    }

    // Always parse as JSON, assuming Reve AI API always returns JSON
    const response = await reveResponse.json();

    const {
      image,
      content_violation,
      request_id,
      version,
      credits_used,
      credits_remaining,
    } = response;

    let dataUri: string | null = null;

    if (image) {
      const mimeType = "image/jpg"; // Assuming image is always JPG from Reve AI
      dataUri = `data:${mimeType};base64,${image}`;
    }

    const responseBody = {
      dataUri,
      title: "",
      description: [
        request_id,
        content_violation,
        credits_remaining,
        version,
        credits_used,
      ]
        .filter((v) => v)
        .join(", "),
      message: "",
      metadata: {
        model: "",
        mocked: false,
        timestamp: new Date().toISOString(),
      },
    };

    logToFile({
      request: requestPayload,
      response: responseBody,
      reveResult: response,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      headers,
    };
  } catch (err: unknown) {
    // Detect quota / rate limit errors and return 429 with retry info when possible
    const message = (err instanceof Error ? err.message : String(err));

    const errorBody = { error: message };
    logToFile({ request: requestPayload, error: err, response: errorBody });
    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
      headers,
    };
  }
};
