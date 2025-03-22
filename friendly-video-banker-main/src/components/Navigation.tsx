
import React from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Video, FileText, MessageSquare, CheckCircle } from 'lucide-react';

const Navigation: React.FC = () => {
  const { status } = useApplication();
  
  const steps = [
    { id: 'video_intro', label: 'Introduction', icon: Video },
    { id: 'document_upload', label: 'Documents', icon: FileText },
    { id: 'video_questions', label: 'Interview', icon: MessageSquare },
    { id: 'processing', label: 'Decision', icon: CheckCircle },
  ];
  
  const getCurrentStepIndex = () => {
    const statusIndex = steps.findIndex(step => step.id === status);
    if (statusIndex === -1) {
      // For final statuses (approved, rejected, more_info), show all steps as completed
      if (['approved', 'rejected', 'more_info'].includes(status)) {
        return steps.length;
      }
      // For initial status, show none as completed
      return 0;
    }
    return statusIndex;
  };
  
  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <div className="glass-card rounded-full py-3 px-4 mx-auto max-w-xl mb-8 animate-slide-down">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-finesse-600 text-white' 
                    : isCurrent 
                    ? 'bg-white shadow-md border border-finesse-100' 
                    : 'bg-gray-100 text-gray-400'
                } transition-all duration-300`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 ${
                  isCompleted || isCurrent ? 'text-finesse-800' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${
                  index < currentStepIndex ? 'bg-finesse-400' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
