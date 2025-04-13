export interface AnalysisVisionData {
  description: string;
  categories: string[];
  palette: string[];
  processingTime: number;
  model: string;
}

export interface AnalysisHearingData {
  transcript: string;
  language: string;
  translation: string;
  processingTime: number;
  model: string;
}

export type AnalysisHearingDataOrNull = AnalysisHearingData | null;

 