export enum GEMINI_MODELS {
  /** Frontier-class performance at a fraction of the cost (GA) */
  GEMINI_3_1_FLASH_LITE = "models/gemini-3.1-flash-lite",
  /** Most intelligent model for agentic and coding tasks (GA) */
  GEMINI_3_5_FLASH = "models/gemini-3.5-flash",
  /** Advanced intelligence and complex problem-solving (preview) */
  GEMINI_3_1_PRO_PREVIEW = "models/gemini-3.1-pro-preview",
  /** Enhanced thinking and reasoning, multimodal understanding, advanced coding */
  GEMINI_2_5_PRO = "models/gemini-2.5-pro",
  /** Adaptive thinking, cost efficiency */
  GEMINI_2_5_FLASH = "models/gemini-2.5-flash",
  /** Most cost-efficient model supporting high throughput */
  GEMINI_2_5_FLASH_LITE = "models/gemini-2.5-flash-lite",
  /** Precise, conversational image generation and editing (GA) */
  GEMINI_3_1_FLASH_IMAGE = "models/gemini-3.1-flash-image",
  /** Precise, conversational image generation and editing */
  GEMINI_2_5_FLASH_IMAGE = "models/gemini-2.5-flash-image",
  /** Low latency, controllable text-to-speech audio generation */
  GEMINI_2_5_FLASH_PREVIEW_TTS = "models/gemini-2.5-flash-preview-tts",
  /** Low latency, controllable text-to-speech audio generation */
  GEMINI_2_5_PRO_PREVIEW_TTS = "models/gemini-2.5-pro-preview-tts",
}

export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.GEMINI_3_1_FLASH_LITE;

export const GEMINI_MODEL_INFO = [
  {
    name: "GEMINI_3_1_FLASH_LITE",
    value: "models/gemini-3.1-flash-lite",
    description: "Most cost-efficient GA model supporting high throughput",
  },
  {
    name: "GEMINI_2_5_FLASH_LITE",
    value: "models/gemini-2.5-flash-lite",
    description: "Cost-efficient (deprecated Oct 2026, use 3.1 Flash-Lite)",
  },
  {
    name: "GEMINI_3_5_FLASH",
    value: "models/gemini-3.5-flash",
    description: "Most intelligent GA model for agentic and coding tasks",
  },
  {
    name: "GEMINI_2_5_FLASH",
    value: "models/gemini-2.5-flash",
    description: "Balanced thinking and speed (deprecated Oct 2026)",
  },
  {
    name: "GEMINI_3_1_PRO_PREVIEW",
    value: "models/gemini-3.1-pro-preview",
    description: "Advanced intelligence and complex problem-solving",
  },
  {
    name: "GEMINI_2_5_PRO",
    value: "models/gemini-2.5-pro",
    description: "Deep reasoning and coding (deprecated Oct 2026)",
  },
  {
    name: "GEMINI_3_1_FLASH_IMAGE",
    value: "models/gemini-3.1-flash-image",
    description: "Image generation and editing (GA)",
  },
  {
    name: "GEMINI_2_5_FLASH_IMAGE",
    value: "models/gemini-2.5-flash-image",
    description: "Image generation and editing (deprecated Oct 2026)",
  },
  {
    name: "GEMINI_2_5_FLASH_PREVIEW_TTS",
    value: "models/gemini-2.5-flash-preview-tts",
    description: "Low latency text-to-speech audio generation",
  },
  {
    name: "GEMINI_2_5_PRO_PREVIEW_TTS",
    value: "models/gemini-2.5-pro-preview-tts",
    description: "High-fidelity text-to-speech audio generation",
  },
];

export const NOT_SUPPORTED_FOR_IMAGE_ANALYSE = [
  "models/gemini-3.1-flash-image",
  "models/gemini-2.5-flash-image",
  "models/gemini-2.5-flash-preview-tts",
  "models/gemini-2.5-pro-preview-tts",
];

export const IMAGE_GENERATION_MODELS = [
  "models/gemini-3.1-flash-image",
  "models/gemini-2.5-flash-image",
];
