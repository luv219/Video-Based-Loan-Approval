
// Type definitions for the experimental FaceDetector API
// This is not fully supported in all browsers

interface FaceDetectorOptions {
  maxDetectedFaces?: number;
  fastMode?: boolean;
}

declare class FaceDetector {
  constructor(options?: FaceDetectorOptions);
  detect(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<DetectedFace[]>;
}

interface DetectedFace {
  boundingBox: DOMRect;
  landmarks?: {
    locations: { x: number; y: number }[];
    type: string;
  }[];
}

interface WindowWithFaceDetector extends Window {
  FaceDetector?: typeof FaceDetector;
}

// Augment the window interface
declare global {
  interface Window {
    FaceDetector?: typeof FaceDetector;
  }
}
