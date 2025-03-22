export const startVideoRecording = async (): Promise<{
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: BlobPart[];
}> => {
  try {
    // First check if MediaRecorder is available in the browser
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('MediaRecorder is not supported in this browser');
    }
    
    // Request camera and microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }, 
      audio: true 
    });
    
    // Check for supported MIME types
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
      ''  // Empty string means let the browser choose
    ];
    
    let selectedMimeType = '';
    for (const mimeType of mimeTypes) {
      if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }
    
    // Create recorder with lower bitrate and options
    const options: MediaRecorderOptions = {};
    
    if (selectedMimeType) {
      options.mimeType = selectedMimeType;
    }
    
    // Use lower bitrates to increase compatibility
    options.audioBitsPerSecond = 128000;
    options.videoBitsPerSecond = 2500000;
    
    try {
      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      });

      // Test if the recorder is really working
      recorder.addEventListener('error', (event) => {
        console.error('MediaRecorder error:', event);
        throw new Error('MediaRecorder encountered an error');
      });

      return { stream, recorder, chunks };
    } catch (recorderError) {
      console.error('Error creating MediaRecorder:', recorderError);
      
      // Last resort - try with no options at all
      console.log('Trying with default recorder options');
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      });
      
      return { stream, recorder, chunks };
    }
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error('Could not access camera or initialize recorder. Please check permissions and try again.');
  }
};

export const stopVideoRecording = ({
  stream,
  recorder,
  chunks,
}: {
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: BlobPart[];
}): Promise<Blob> => {
  return new Promise((resolve) => {
    recorder.addEventListener('stop', () => {
      // Determine the blob type based on the recorder's mimeType or default to webm
      const mimeType = recorder.mimeType || 'video/webm';
      const videoBlob = new Blob(chunks, { type: mimeType });
      stream.getTracks().forEach((track) => track.stop());
      resolve(videoBlob);
    });

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  });
};

export const createVideoPreview = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// Define a FaceDetector interface for TypeScript
interface FaceDetectorInterface {
  detect: (element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<{ boundingBox: DOMRect }[]>;
}

// Basic face detection using the browser API
export const detectFace = async (videoElement: HTMLVideoElement): Promise<boolean> => {
  // Check if FaceDetector is available in the browser
  const hasFaceDetectorAPI = 'FaceDetector' in window;
  
  if (!hasFaceDetectorAPI) {
    console.warn('FaceDetector is not available in this browser');
    return true; // Assuming face is present if detection is not available
  }

  try {
    // Type assertion for FaceDetector
    const FaceDetector = (window as any).FaceDetector;
    const faceDetector = new FaceDetector() as FaceDetectorInterface;
    const faces = await faceDetector.detect(videoElement);
    return faces.length > 0;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return true; // Assuming face is present if there's an error
  }
};

// Standard set of questions for the loan application
export const loanApplicationQuestions = [
  {
    id: 'introduction',
    branchManagerScript: "Hello, I'm your virtual branch manager at Finesse Bank. I'll be guiding you through the loan application process. Let's start with a brief introduction - please tell me your name and why you're applying for a loan today.",
    responsePrompt: "Record your introduction",
    maxDuration: 60 // seconds
  },
  {
    id: 'loan_amount',
    branchManagerScript: "Thank you. How much would you like to borrow, and what will be the purpose of this loan?",
    responsePrompt: "Record your loan amount and purpose",
    maxDuration: 45
  },
  {
    id: 'employment',
    branchManagerScript: "Could you tell me about your current employment? Include your job title, employer name, and how long you've been working there.",
    responsePrompt: "Record your employment details",
    maxDuration: 60
  },
  {
    id: 'income',
    branchManagerScript: "What is your monthly income, and do you have any additional sources of income?",
    responsePrompt: "Record your income details",
    maxDuration: 45
  },
  {
    id: 'existing_debts',
    branchManagerScript: "Do you have any existing loans or credit card debts? If yes, please provide details including the outstanding amounts and monthly payments.",
    responsePrompt: "Record your existing debt information",
    maxDuration: 60
  },
  {
    id: 'confirmation',
    branchManagerScript: "Thank you for providing all the information. I'll now process your application based on the details and documents you've shared. You'll receive the decision shortly.",
    responsePrompt: null, // No response needed for this one
    maxDuration: 0
  }
];
