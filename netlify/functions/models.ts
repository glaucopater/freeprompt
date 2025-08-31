export enum GEMINI_MODELS {
  /** Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more */
  GEMINI_2_5_PRO = "models/gemini-2.5-pro",
  /** Adaptive thinking, cost efficiency */
  GEMINI_2_5_FLASH = "models/gemini-2.5-flash",
  /** Most cost-efficient model supporting high throughput */
  GEMINI_2_5_FLASH_LITE = "models/gemini-2.5-flash-lite",
  /** Low-latency bidirectional voice and video interactions */
  GEMINI_LIVE_2_5_FLASH_PREVIEW = "models/gemini-live-2.5-flash-preview",
  /** High quality, natural conversational audio outputs, with or without thinking */
  GEMINI_2_5_FLASH_PREVIEW_NATIVE_AUDIO_DIALOG = "models/gemini-2.5-flash-preview-native-audio-dialog",
  /** High quality, natural conversational audio outputs, with or without thinking */
  GEMINI_2_5_FLASH_EXP_NATIVE_AUDIO_THINKING_DIALOG = "models/gemini-2.5-flash-exp-native-audio-thinking-dialog",
  /** Precise, conversational image generation and editing */
  GEMINI_2_5_FLASH_IMAGE_PREVIEW = "models/gemini-2.5-flash-image-preview",
  /** Low latency, controllable, single- and multi-speaker text-to-speech audio generation */
  GEMINI_2_5_FLASH_PREVIEW_TTS = "models/gemini-2.5-flash-preview-tts",
  /** Low latency, controllable, single- and multi-speaker text-to-speech audio generation */
  GEMINI_2_5_PRO_PREVIEW_TTS = "models/gemini-2.5-pro-preview-tts",
  /** Next generation features, speed, and realtime streaming. */
  GEMINI_2_0_FLASH = "models/gemini-2.0-flash",
  /** Conversational image generation and editing */
  GEMINI_2_0_FLASH_PREVIEW_IMAGE_GENERATION = "models/gemini-2.0-flash-preview-image-generation",
  /** Cost efficiency and low latency */
  GEMINI_2_0_FLASH_LITE = "models/gemini-2.0-flash-lite",
  /** Cost efficiency and low latency */
  GEMINI_2_0_FLASH_LITE_PREVIEW_02_05 = "models/gemini-2.0-flash-lite-preview-02-05",
  /** Low-latency bidirectional voice and video interactions */
  GEMINI_2_0_FLASH_LIVE_001 = "models/gemini-2.0-flash-live-001",
  /** Fast and versatile performance across a diverse variety of tasks */
  GEMINI_1_5_FLASH = "models/gemini-1.5-flash",
  /** High volume and lower intelligence tasks (Deprecated) */
  GEMINI_1_5_FLASH_8B = "models/gemini-1.5-flash-8b",
  /** Complex reasoning tasks requiring more intelligence (Deprecated) */
  GEMINI_1_5_PRO = "models/gemini-1.5-pro",
}

export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.GEMINI_2_5_FLASH_LITE;

export const GEMINI_MODEL_INFO = [
  { name: "GEMINI_2_5_FLASH_LITE", value: "models/gemini-2.5-flash-lite", description: "Most cost-efficient model supporting high throughput" },
  { name: "GEMINI_2_0_FLASH", value: "models/gemini-2.0-flash", description: "Next generation features, speed, and realtime streaming." },  
  { name: "GEMINI_2_0_FLASH_LITE_PREVIEW_02_05", value: "models/gemini-2.0-flash-lite-preview-02-05", description: "Cost efficiency and low latency" },
  { name: "GEMINI_2_0_FLASH_LITE", value: "models/gemini-2.0-flash-lite", description: "Cost efficiency and low latency" },
  { name: "GEMINI_1_5_FLASH", value: "models/gemini-1.5-flash", description: "Fast and versatile performance across a diverse variety of tasks" },
  { name: "GEMINI_2_5_FLASH", value: "models/gemini-2.5-flash", description: "Adaptive thinking, cost efficiency" },
  { name: "GEMINI_2_5_PRO", value: "models/gemini-2.5-pro", description: "Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more" },
  { name: "GEMINI_LIVE_2_5_FLASH_PREVIEW", value: "models/gemini-live-2.5-flash-preview", description: "Low-latency bidirectional voice and video interactions" },
  { name: "GEMINI_2_5_FLASH_PREVIEW_NATIVE_AUDIO_DIALOG", value: "models/gemini-2.5-flash-preview-native-audio-dialog", description: "High quality, natural conversational audio outputs, with or without thinking" },
  { name: "GEMINI_2_5_FLASH_EXP_NATIVE_AUDIO_THINKING_DIALOG", value: "models/gemini-2.5-flash-exp-native-audio-thinking-dialog", description: "High quality, natural conversational audio outputs, with or without thinking" },
  { name: "GEMINI_2_5_FLASH_IMAGE_PREVIEW", value: "models/gemini-2.5-flash-image-preview", description: "Precise, conversational image generation and editing" },
  { name: "GEMINI_2_5_FLASH_PREVIEW_TTS", value: "models/gemini-2.5-flash-preview-tts", description: "Low latency, controllable, single- and multi-speaker text-to-speech audio generation" },
  { name: "GEMINI_2_5_PRO_PREVIEW_TTS", value: "models/gemini-2.5-pro-preview-tts", description: "Low latency, controllable, single- and multi-speaker text-to-speech audio generation" },
  { name: "GEMINI_2_0_FLASH_PREVIEW_IMAGE_GENERATION", value: "models/gemini-2.0-flash-preview-image-generation", description: "Conversational image generation and editing" },
  { name: "GEMINI_2_0_FLASH_LIVE_001", value: "models/gemini-2.0-flash-live-001", description: "Low-latency bidirectional voice and video interactions" },  
];

// NOR supported for images analyzes  

export const NOT_SUPPORTED_FOR_IMAGE_ANALYSE = [
  "models/gemini-2.0-flash-live-001",
  "models/gemini-live-2.5-flash-preview",
  "models/gemini-2.5-flash-preview-native-audio-dialog",
  "models/gemini-2.5-flash-exp-native-audio-thinking-dialog",
  "models/gemini-2.5-flash-image-preview",
  "models/gemini-2.5-flash-preview-tts",
  "models/gemini-2.5-pro-preview-tts",
  "models/gemini-2.0-flash-preview-image-generation"
]



