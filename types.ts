
export type AppMode = 'single' | 'batch';
export type FitStyle = 'Tight' | 'Standard' | 'Loose';

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
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export interface GeminiPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}
