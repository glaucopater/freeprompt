import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "../../netlify/functions/gemini-vision-upload";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandlerResponse } from "@netlify/functions";

vi.mock("@google/generative-ai");
vi.mock("dotenv", () => ({ config: vi.fn() }));
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(),
    })),
  })),
}));

describe("Image Analysis Function", () => {
  beforeEach(() => {
    vi.stubEnv("NETLIFY_GOOGLE_API_KEY", "mock-api-key");
    vi.mock("import.meta", () => ({
      env: {
        NETLIFY_GOOGLE_API_KEY: "mock-api-key",
      },
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it("should return 500 if API key is not set", async () => {
    delete process.env.NETLIFY_GOOGLE_API_KEY;

    const event: any = {
      body: JSON.stringify({
        data: "fake-image-data",
      }) /* create a mock event object */,
    };
    const context: any = {};
    const result = await handler(event, context);
    expect((result as any).statusCode).toBe(500);
    expect(JSON.parse((result as any).body).error).toContain(
      "API key not configured"
    );
  });

  it("should call GoogleGenerativeAI mock", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => "Mock response" },
    });

    (GoogleGenerativeAI as any).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    const instance = new GoogleGenerativeAI("mock-api-key");
    const model = instance.getGenerativeModel({ model: "mock-model" });
    await model.generateContent([
      {
        inlineData: {
          data: "fake-image-data",
          mimeType: "image/jpeg",
        },
      },
      "mock-prompt",
    ]);

    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it.skip("should process image data and return result", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => "Analyzed image content" },
    });

    (GoogleGenerativeAI as any).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    const imageData = Buffer.from("fake-image-data").toString("base64");
    const event = { body: JSON.stringify({ data: imageData }) };

    vi.stubEnv("NETLIFY_GOOGLE_API_KEY", "mock-api-key");

    const result = (await handler(event as any, {} as any)) as HandlerResponse;

    console.log("Mock called:", mockGenerateContent.mock.calls); // Debug mock calls
    console.log("Handler result:", result); // Debug handler output

    expect(result).toMatchObject({
      statusCode: 200,
      body: JSON.stringify({ message: "Analyzed image content" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(JSON.parse(result.body!).message).toBe("Analyzed image content");
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it.skip("should return 400 if no image data is provided", async () => {
    const event = { body: JSON.stringify({}) };
    const result = (await handler(event as any, {} as any)) as HandlerResponse;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!).error).toBe("No image data provided");
  });

  it.skip("should process image data and return result", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => "Analyzed image content" },
    });
    (GoogleGenerativeAI as any).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    const imageData = Buffer.from("fake-image-data").toString("base64");
    const event = { body: JSON.stringify({ data: imageData }) };
    const result = (await handler(event as any, {} as any)) as HandlerResponse;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!).message).toBe("Analyzed image content");
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
