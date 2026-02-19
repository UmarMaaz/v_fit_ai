export type StylePreset = 'Studio' | 'Street' | 'Runway' | 'Luxury' | 'Vibrant';
export type FitStyle = 'Tight' | 'Standard' | 'Loose';
export type AppMode = 'single' | 'batch';

export interface ImageData {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
}

export interface GenerationResult {
  id: string;
  garmentName: string;
  imageUrl: string;
  originalImageUrl?: string;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
  preset?: StylePreset;
}

export interface GeminiPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}
