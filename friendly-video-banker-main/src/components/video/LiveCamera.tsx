
import React, { useRef, useEffect } from 'react';

interface LiveCameraProps {
  stream: MediaStream | null;
}

const LiveCamera: React.FC<LiveCameraProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

export default LiveCamera;
