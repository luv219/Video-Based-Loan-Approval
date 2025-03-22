
import { useState, useRef, useEffect } from 'react';
import { startVideoRecording, stopVideoRecording } from '@/utils/videoUtils';
import { useToast } from '@/components/ui/use-toast';

interface UseVideoRecordingProps {
  maxDuration: number;
}

export const useVideoRecording = ({ maxDuration }: UseVideoRecordingProps) => {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mediaState, setMediaState] = useState<{
    stream: MediaStream | null;
    recorder: MediaRecorder | null;
    chunks: BlobPart[];
  }>({
    stream: null,
    recorder: null,
    chunks: [],
  });

  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // Initialize camera when component mounts
  const initializeCamera = async () => {
    try {
      setCameraError(null);
      
      const { stream, recorder, chunks } = await startVideoRecording();
      setMediaState({ stream, recorder, chunks });
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      setCameraError(error instanceof Error ? error.message : 'Unknown camera error');
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Could not access your camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  };

  // Stop camera and clean up resources
  const stopCamera = () => {
    if (mediaState.stream) {
      mediaState.stream.getTracks().forEach(track => track.stop());
    }
    setMediaState({ stream: null, recorder: null, chunks: [] });
  };

  // Start countdown before recording
  const startCountdown = () => {
    setCountdown(3);
    setPreviewUrl(null);
  };

  // Start actual recording
  const startRecording = () => {
    if (!mediaState.recorder) {
      console.error('MediaRecorder not initialized');
      toast({
        title: "Recording Error",
        description: "Media recorder is not initialized. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      mediaState.recorder.start();
      setRecording(true);
      setElapsedTime(0);

      // Start timer to track elapsed recording time
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: error instanceof Error ? error.message : "Failed to start recording. Your browser may not support this feature.",
        variant: "destructive",
      });
    }
  };

  // Stop recording and create preview
  const stopRecording = async () => {
    if (!mediaState.recorder || !mediaState.stream) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Only stop the recorder if it's not already inactive
      if (mediaState.recorder.state !== 'inactive') {
        const videoBlob = await stopVideoRecording(mediaState);
        const url = URL.createObjectURL(videoBlob);
        setPreviewUrl(url);
        setRecording(false);
        return videoBlob;
      } else {
        setRecording(false);
        return null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        title: "Recording Error",
        description: "There was a problem with the recording. Please try again.",
        variant: "destructive",
      });
      setRecording(false);
      return null;
    }
  };

  // Re-record video
  const handleReRecord = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    startCountdown();
  };

  // Handle countdown and auto-start recording
  useEffect(() => {
    if (countdown > 0 && countdown <= 3) {
      countdownRef.current = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      startRecording();
      setCountdown(-1);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  return {
    recording,
    countdown,
    elapsedTime,
    previewUrl,
    cameraError,
    mediaState,
    initializeCamera,
    stopCamera,
    startCountdown,
    stopRecording,
    handleReRecord,
    setPreviewUrl
  };
};
