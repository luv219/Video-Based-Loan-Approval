
import React from 'react';

interface VideoInstructionsProps {
  status: 'video_intro' | 'video_questions' | string;
  customerName: string;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  questionScript?: string;
  responsePrompt?: string | null;
}

const VideoInstructions: React.FC<VideoInstructionsProps> = ({
  status,
  customerName,
  onNameChange,
  questionScript,
  responsePrompt
}) => {
  if (status === 'video_intro') {
    return (
      <div className="text-center max-w-md mx-auto mb-6 animate-fade-in">
        <h3 className="text-xl font-medium mb-2">Welcome to Finesse</h3>
        <p className="text-muted-foreground mb-4">
          Let's start with a quick introduction. Please enter your name below and then record a short introduction video.
        </p>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your Full Name"
            value={customerName}
            onChange={onNameChange}
            className="w-full px-4 py-2 rounded-md border border-input bg-white/50 backdrop-blur-sm focus:border-finesse-400 focus:ring-2 focus:ring-finesse-400/20 transition-all"
          />
        </div>
      </div>
    );
  } else if (status === 'video_questions' && questionScript) {
    return (
      <div className="text-center max-w-md mx-auto mb-6 animate-fade-in">
        <h3 className="text-xl font-medium mb-2">Branch Manager Question</h3>
        <p className="text-finesse-700 italic mb-4">
          "{questionScript}"
        </p>
        {responsePrompt && (
          <p className="text-sm text-muted-foreground">
            {responsePrompt}
          </p>
        )}
      </div>
    );
  }
  
  return null;
};

export default VideoInstructions;
