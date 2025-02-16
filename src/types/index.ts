export interface AnalysisVisionData {
  description: string;
  categories: string[];
  palette: string[];
}

export interface AnalysisHearingData {
  transcript: string;
  language: string;
  translation: string;
}
