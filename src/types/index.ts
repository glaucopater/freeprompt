export interface AnalysisVisionData {
  description: string;
  categories: string[];
  palette: string[];
  processingTime: number;
  model: string;
  imageStats?: {
    originalSize: number;
    resizedSize: number;
    originalWidth?: number;
    originalHeight?: number;
    originalAspectRatio?: number;
    resizedWidth?: number;
    resizedHeight?: number;
    resizedAspectRatio?: number;
  };
}

export interface AnalysisHearingData {
  transcript: string;
  language: string;
  translation: string;
  processingTime: number;
  model: string;
}

export type AnalysisHearingDataOrNull = AnalysisHearingData | null;

 