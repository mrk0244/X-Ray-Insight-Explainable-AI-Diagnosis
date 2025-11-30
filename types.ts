export interface HeatmapRegion {
  y_min: number; // 0 to 100 (percentage)
  x_min: number;
  y_max: number;
  x_max: number;
  intensity: number; // 0.0 to 1.0
  description: string;
}

export interface AnalysisResult {
  diagnosis: 'Pneumonia' | 'Normal' | 'Uncertain';
  confidence: number;
  summary: string;
  findings: string[];
  heatmap_regions: HeatmapRegion[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: AnalysisResult;
}