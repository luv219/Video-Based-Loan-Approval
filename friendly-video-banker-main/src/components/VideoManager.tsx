
import React, { useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { loanApplicationQuestions } from '@/utils/videoUtils';
import { Card } from '@/components/ui/card';
import { useVideoRecording } from '@/hooks/useVideoRecording';

// Import smaller components
import VideoCountdown from './video/VideoCountdown';
import VideoPreview from './video/VideoPreview';
import LiveCamera from './video/LiveCamera';
import RecordingIndicator from './video/RecordingIndicator';
import RecordingProgress from './video/RecordingProgress';
import CameraErrorDisplay from './video/CameraErrorDisplay';
import VideoControls from './video/VideoControls';
import VideoInstructions from './video/VideoInstructions';

const VideoManager: React.FC = () => {
  const {
    status,
    setStatus,
    currentQuestion,
    setCurrentQuestion,
    addVideoResponse,
    customerName,
    setCustomerName,
  } = useApplication();

  const currentQuestionData = loanApplicationQuestions[currentQuestion];
  const maxDuration = currentQuestionData?.maxDuration || 60;

  const {
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
    handleReRecord
  } = useVideoRecording({ maxDuration });

  // Initialize camera when component mounts based on status
  useEffect(() => {
    if (status === 'video_intro' || status === 'video_questions') {
      initializeCamera();
    }

    return () => {
      stopCamera();
    };
  }, [status]);

  // Handle name input change
  const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(event.target.value);
  };

  // Handle submitting a recording
  const handleSubmitRecording = async () => {
    if (status === 'video_intro') {
      // If it's the intro, move to document upload
      setStatus('document_upload');
    } else if (status === 'video_questions') {
      // If it's a question, move to the next question or to processing
      if (currentQuestion < loanApplicationQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setStatus('processing');
      }
    }
  };

  // Submit current recording and store in application context
  const handleStopRecording = async () => {
    const videoBlob = await stopRecording();
    
    if (videoBlob && status === 'video_questions') {
      addVideoResponse({
        questionId: currentQuestionData.id,
        videoBlob,
      });
    }
  };

  return (
    <Card className="mx-auto max-w-3xl glass-card p-6 animate-slide-up">
      <VideoInstructions 
        status={status}
        customerName={customerName}
        onNameChange={updateName}
        questionScript={currentQuestionData?.branchManagerScript}
        responsePrompt={currentQuestionData?.responsePrompt}
      />

      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-black/20 mb-4">
        <VideoCountdown countdown={countdown} />
        <RecordingIndicator isRecording={recording} />

        {cameraError ? (
          <CameraErrorDisplay 
            errorMessage={cameraError}
            onRetry={initializeCamera}
            onSkip={() => setStatus('document_upload')}
            showSkip={status === 'video_intro' || status === 'video_questions'}
          />
        ) : !previewUrl ? (
          <LiveCamera stream={mediaState.stream} />
        ) : (
          <VideoPreview previewUrl={previewUrl} />
        )}
      </div>

      <RecordingProgress 
        isRecording={recording}
        elapsedTime={elapsedTime}
        maxDuration={maxDuration}
      />

      <VideoControls 
        isRecording={recording}
        hasPreview={!!previewUrl}
        hasError={!!cameraError}
        onStartRecording={startCountdown}
        onStopRecording={handleStopRecording}
        onReRecord={handleReRecord}
        onSubmit={handleSubmitRecording}
        isIntroduction={status === 'video_intro'}
      />
    </Card>
  );
};

export default VideoManager;
