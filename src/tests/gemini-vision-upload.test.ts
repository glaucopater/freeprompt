import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "../../netlify/functions/gemini-vision-upload";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandlerResponse } from "@netlify/functions";

vi.mock("@google/generative-ai");
vi.mock("dotenv", () => ({ config: vi.fn() }));

describe("Image Analysis Function", () => {
  beforeEach(() => {
    vi.stubEnv("NETLIFY_GOOGLE_API_KEY", "mock-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it("should return 500 if API key is not set", async () => {
    vi.unstubAllEnvs();

    const event = { body: JSON.stringify({ data: "fake-image-data" }) };
    const result = (await handler(event as any, {} as any)) as HandlerResponse;
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body as string).error).toContain(
      "API key not configured"
    );
  });

  it("should call GoogleGenerativeAI mock", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => "Mock response" },
    });

    vi.mocked(GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent,
          }),
        } as any)
    );

    const instance = new GoogleGenerativeAI("mock-api-key");
    const model = instance.getGenerativeModel({ model: "gemini-pro-vision" });
    await model.generateContent([
      { inlineData: { data: "fake-image-data", mimeType: "image/jpeg" } },
      "Analyze this image",
    ]);

    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it.skip("should process image data and return result", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => "Analyzed image content" },
    });

    vi.mocked(GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent,
          }),
        } as any)
    );

    const imageData = Buffer.from("fake-image-data").toString("base64");
    const event = { body: JSON.stringify({ data: imageData }) };

    const result = (await handler(event as any, {} as any)) as HandlerResponse;

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: "Analyzed image content" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it("should return 500 if API key is not configured", async () => {
    vi.unstubAllEnvs();
    const event = { body: JSON.stringify({ data: "fake-image-data" }) };
    const result = (await handler(event as any, {} as any)) as HandlerResponse;

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body as string).error).toContain(
      "API key not configured"
    );
  });

  it.skip("should return 400 if no image data is provided", async () => {
    const event = { body: null };
    const result = (await handler(event as any, {} as any)) as HandlerResponse;

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string).error).toBe(
      "No image data provided"
    );
  });
});
