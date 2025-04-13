import { describe, it, expect } from "vitest";
import { parseVisionResponseData, parseAudioResponseData } from ".";

const mockVisionResponseData = [
  "A cartoon bee is illustrated with photography, settings, and social media symbols around it, suggesting a connection to digital services or marketing.\n\nIllustration, Mascot, Icon\n\n#F0E68C,#FFFFE0,#00FFFF,#808080,#000000",
  "The image depicts a cosmic battle between a futuristic, cyborg-like figure and a large, serpentine dragon amidst a backdrop of planets, galaxies, and space debris, with an energy clash occurring between the two.\n\nSci-fi, fantasy, space, action, digital art\n\n#C0C0C0, #00FFFF, #808000, #A0522D, #000080",
  "The image features a silhouette of a figure set against a vibrant backdrop of cosmic nebulae, planets, and stars, with glowing eyes and a distinct shape. It evokes a sense of mystery and grandeur.\n\nFantasy, Science Fiction, Art\n\n#000080, #4682B4, #483D8B, #778899, #00FFFF",
];

const mockHearingResponseData = [
  "**Transcript:** สวัสดีค่ะ วันนี้เราออกมา กินข้าว\n**Language:** Thai\n**Translation:** Hello, today we are out eating.\n",
  "**Transcript:** If the Porsche Macan has proven anything, it's that the days of sacrificing performance for practicality are gone. Long gone. Engineered to deliver a driving experience like no other, the Macan has demonstrated excellence in style and performance to become the leading sports car in its class. So don't let those five doors fool you. Once you're in the driver's seat, one thing will become immediately clear. This is a Porsche. The Macan, now leasing from 3.99%. Conditions apply.\n\n**Language:** English",
];

const mockMetadata = {
  processingTime: 1000,
  model: "gemini-pro"
};

describe("parseVisionResponseData", () => {
  it("should test a response mock 1", async () => {
    const response = {
      message: mockVisionResponseData[1],
    };
    const result = parseVisionResponseData(response.message, mockMetadata);
    expect(result).toEqual({
      description:
        "The image depicts a cosmic battle between a futuristic, cyborg-like figure and a large, serpentine dragon amidst a backdrop of planets, galaxies, and space debris, with an energy clash occurring between the two.",
      categories: ["Sci-fi", "fantasy", "space", "action", "digital art"],
      palette: ["#C0C0C0", "#00FFFF", "#808000", "#A0522D", "#000080"],
      processingTime: 1000,
      model: "gemini-pro"
    });
  });

  it("should test a response mock 2", async () => {
    const message = mockVisionResponseData[0];
    const result = parseVisionResponseData(message, mockMetadata);
    expect(result.description).toEqual(
      "A cartoon bee is illustrated with photography, settings, and social media symbols around it, suggesting a connection to digital services or marketing."
    );
    expect(result.categories).toEqual(["Illustration", "Mascot", "Icon"]);
    expect(result.palette).toHaveLength(5);
    expect(result.processingTime).toEqual(1000);
    expect(result.model).toEqual("gemini-pro");
  });

  it("should test a response mock 3", async () => {
    const message = mockVisionResponseData[2];
    const result = parseVisionResponseData(message, mockMetadata);
    expect(result.description).toEqual(
      "The image features a silhouette of a figure set against a vibrant backdrop of cosmic nebulae, planets, and stars, with glowing eyes and a distinct shape. It evokes a sense of mystery and grandeur."
    );
    expect(result.categories).toEqual(["Fantasy", "Science Fiction", "Art"]);
    expect(result.palette).toHaveLength(5);
    expect(result.processingTime).toEqual(1000);
    expect(result.model).toEqual("gemini-pro");
  });

  it("should parse the response data correctly with metadata", () => {
    const response = mockVisionResponseData[0];
    const data = parseVisionResponseData(response, mockMetadata);
    expect(data).toEqual({
      description: "A cartoon bee is illustrated with photography, settings, and social media symbols around it, suggesting a connection to digital services or marketing.",
      categories: ["Illustration", "Mascot", "Icon"],
      palette: ["#F0E68C", "#FFFFE0", "#00FFFF", "#808080", "#000000"],
      processingTime: 1000,
      model: "gemini-pro"
    });
  });
});

describe("parseHearingResponseData", () => {
  it("should test a response mock 1", async () => {
    const response = mockHearingResponseData[0];
    const { transcript, language, translation, processingTime, model } =
      parseAudioResponseData(response, mockMetadata);
    expect(transcript).toEqual("สวัสดีค่ะ วันนี้เราออกมา กินข้าว");
    expect(language).toEqual("Thai");
    expect(translation).toEqual("Hello, today we are out eating.");
    expect(processingTime).toEqual(1000);
    expect(model).toEqual("gemini-pro");
  });
});
