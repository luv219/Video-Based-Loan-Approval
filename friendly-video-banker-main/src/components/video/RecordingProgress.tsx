
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RecordingProgressProps {
  isRecording: boolean;
  elapsedTime: number;
  maxDuration: number;
}

const RecordingProgress: React.FC<RecordingProgressProps> = ({ 
  isRecording, 
  elapsedTime, 
  maxDuration 
}) => {
  if (!isRecording) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-1">
        <span>Recording in progress...</span>
        <span>{elapsedTime}s / {maxDuration}s</span>
      </div>
      <Progress value={(elapsedTime / maxDuration) * 100} className="h-2" />
    </div>
  );
};

export default RecordingProgress;
