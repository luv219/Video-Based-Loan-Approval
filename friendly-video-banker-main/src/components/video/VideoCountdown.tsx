
import React from 'react';

interface VideoCountdownProps {
  countdown: number;
}

const VideoCountdown: React.FC<VideoCountdownProps> = ({ countdown }) => {
  if (countdown <= 0 || countdown > 3) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
      <span className="text-6xl text-white font-bold animate-pulse">{countdown}</span>
    </div>
  );
};

export default VideoCountdown;
