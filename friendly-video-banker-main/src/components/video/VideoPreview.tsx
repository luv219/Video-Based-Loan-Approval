
import React, { useRef, useEffect } from 'react';

interface VideoPreviewProps {
  previewUrl: string | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ previewUrl }) => {
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (previewRef.current && previewUrl) {
      previewRef.current.src = previewUrl;
      previewRef.current.load();
    }
  }, [previewUrl]);

  if (!previewUrl) return null;

  return (
    <video
      ref={previewRef}
      controls
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

export default VideoPreview;
