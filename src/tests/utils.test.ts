import { describe, it, expect } from "vitest";
import { AnalysisVisionData } from "../types";
import { parseVisionResponseData } from "../utils";

const rawResponse = {
  message:
    "A colossal serpent and a futuristic robot clash amidst a cosmic backdrop of galaxies, planets, and fiery projectiles, locked in an epic battle.\n\nfantasy, scifi, space, robot, dragon, battle, fight, cosmos, galaxy, futuristic, conflict, serpent, epic, energy, magic\n\n#000000, #FFFFFF, #FFA500, #008000, #808080",
};
// Example data - in real app this would come from API
const analysisData: AnalysisVisionData = {
  description:
    "A colossal serpent and a futuristic robot clash amidst a cosmic backdrop of galaxies, planets, and fiery projectiles, locked in an epic battle.",
  categories: [
    "fantasy",
    "scifi",
    "space",
    "robot",
    "dragon",
    "battle",
    "fight",
    "cosmos",
    "galaxy",
    "futuristic",
    "conflict",
    "serpent",
    "epic",
    "energy",
    "magic",
  ],
  palette: ["#000000", "#FFFFFF", "#FFA500", "#008000", "#808080"],
};

describe("parseResponseData", () => {
  it("should update the analysis data", () => {
    const data = parseVisionResponseData(rawResponse.message);
    expect(data).toMatchObject(analysisData);
  });
});
