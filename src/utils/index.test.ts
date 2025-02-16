import { describe, it, expect } from "vitest";
import { parseVisionResponseData, parseAudioResponseData } from ".";

const mockVisionResponseData = [
  "A cartoon bee is illustrated with photography, settings, and social media symbols around it, suggesting a connection to digital services or marketing.\n\nIllustration, Mascot, Icon\n\n#F0E68C,#FFFFE0,#00FFFF,#808080,#000000",
  "The image depicts a cosmic battle between a futuristic, cyborg-like figure and a large, serpentine dragon amidst a backdrop of planets, galaxies, and space debris, with an energy clash occurring between the two.\n\nSci-fi, fantasy, space, action, digital art\n\n#C0C0C0, #00FFFF, #808000, #A0522D, #000080",
  "The image features a silhouette of a figure set against a vibrant backdrop of cosmic nebulae, planets, and stars, with glowing eyes and a distinct shape. It evokes a sense of mystery and grandeur.\n\nFantasy, Science Fiction, Art\n\n#000080, #4682B4, #483D8B, #778899, #00FFFF",
];

const mockHearingResponseData = [
  "Okay, here's the information you requested:\n\n**Transcript:** สวัสดีค่ะ วันนี้เราออกมา กินข้าว\n\n**Language:** Thai\n\n**Translation:** Hello, today we are going out to eat.\n",
];

describe("parseVisionResponseData", () => {
  it("should test a response mock 1", async () => {
    const response = {
      message: mockVisionResponseData[1],
    };
    const result = parseVisionResponseData(response.message);
    expect(result).toEqual({
      description:
        "The image depicts a cosmic battle between a futuristic, cyborg-like figure and a large, serpentine dragon amidst a backdrop of planets, galaxies, and space debris, with an energy clash occurring between the two.",
      categories: ["Sci-fi", "fantasy", "space", "action", "digital art"],
      palette: ["#C0C0C0", "#00FFFF", "#808000", "#A0522D", "#000080"],
    });
  });

  it("should test a response mock 2", async () => {
    const message = mockVisionResponseData[0];
    const { description, categories, palette } =
      parseVisionResponseData(message);
    expect(description).toEqual(
      "A cartoon bee is illustrated with photography, settings, and social media symbols around it, suggesting a connection to digital services or marketing."
    );
    expect(categories).toEqual(["Illustration", "Mascot", "Icon"]);
    expect(palette).toHaveLength(5);
  });

  it("should test a response mock 3", async () => {
    const message = mockVisionResponseData[2];
    const { description, categories, palette } =
      parseVisionResponseData(message);
    expect(description).toEqual(
      "The image features a silhouette of a figure set against a vibrant backdrop of cosmic nebulae, planets, and stars, with glowing eyes and a distinct shape. It evokes a sense of mystery and grandeur."
    );
    expect(categories).toEqual(["Fantasy", "Science Fiction", "Art"]);
    expect(palette).toHaveLength(5);
  });
});

describe("parseHearingResponseData", () => {
  it("should test a response mock 1", async () => {
    const response = mockHearingResponseData[0];
    const { transcript, language, translation } =
      parseAudioResponseData(response);
    expect(transcript).toEqual(
      "**Transcript:** สวัสดีค่ะ วันนี้เราออกมา กินข้าว"
    );
    expect(language).toEqual("**Language:** Thai");
    expect(translation).toEqual(
      "**Translation:** Hello, today we are going out to eat."
    );
  });
});
