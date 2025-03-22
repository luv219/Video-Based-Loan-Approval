
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, StopCircle, RefreshCw, Send } from 'lucide-react';

interface VideoControlsProps {
  isRecording: boolean;
  hasPreview: boolean;
  hasError: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReRecord: () => void;
  onSubmit: () => void;
  isIntroduction: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isRecording,
  hasPreview,
  hasError,
  onStartRecording,
  onStopRecording,
  onReRecord,
  onSubmit,
  isIntroduction
}) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {!isRecording && !hasPreview && !hasError && (
        <Button
          onClick={onStartRecording}
          className="bg-finesse-600 hover:bg-finesse-700 text-white transition-all"
        >
          <Video className="w-4 h-4 mr-2" />
          Start Recording
        </Button>
      )}

      {isRecording && (
        <Button
          onClick={onStopRecording}
          variant="destructive"
        >
          <StopCircle className="w-4 h-4 mr-2" />
          Stop Recording
        </Button>
      )}

      {hasPreview && (
        <>
          <Button
            onClick={onReRecord}
            variant="outline"
            className="border-finesse-300 hover:bg-finesse-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Record Again
          </Button>

          <Button
            onClick={onSubmit}
            className="bg-finesse-600 hover:bg-finesse-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isIntroduction ? 'Continue' : 'Submit Answer'}
          </Button>
        </>
      )}
    </div>
  );
};

export default VideoControls;
