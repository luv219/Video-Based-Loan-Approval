
import React from 'react';

interface RecordingIndicatorProps {
  isRecording: boolean;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ isRecording }) => {
  if (!isRecording) return null;
  
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 text-white px-3 py-1 rounded-full">
      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
      <span className="text-sm font-medium">Recording</span>
    </div>
  );
};

export default RecordingIndicator;
