
import React from 'react';
import { Button } from '@/components/ui/button';

interface CameraErrorDisplayProps {
  errorMessage: string | null;
  onRetry: () => void;
  onSkip: () => void;
  showSkip: boolean;
}

const CameraErrorDisplay: React.FC<CameraErrorDisplayProps> = ({ 
  errorMessage, 
  onRetry, 
  onSkip, 
  showSkip 
}) => {
  if (!errorMessage) return null;

  return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{errorMessage}</p>
      <p className="mb-4">Your browser might not support camera access, or permissions may be blocked.</p>
      <Button 
        onClick={onRetry}
        className="bg-finesse-600 hover:bg-finesse-700 text-white mb-4"
      >
        Try Again
      </Button>
      {showSkip && (
        <Button 
          onClick={onSkip}
          variant="outline"
        >
          Skip Video Section
        </Button>
      )}
    </div>
  );
};

export default CameraErrorDisplay;
