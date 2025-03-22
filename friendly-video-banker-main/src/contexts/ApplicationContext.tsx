
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ApplicationStatus = 'initial' | 'video_intro' | 'document_upload' | 'video_questions' | 'processing' | 'approved' | 'rejected' | 'more_info';

export type Document = {
  type: 'aadhaar' | 'pan' | 'income_proof';
  file: File | null;
  status: 'pending' | 'verified' | 'rejected';
  details?: Record<string, string>;
};

type VideoResponse = {
  questionId: string;
  videoBlob: Blob;
};

interface ApplicationContextType {
  status: ApplicationStatus;
  setStatus: (status: ApplicationStatus) => void;
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (index: number, document: Partial<Document>) => void;
  videoResponses: VideoResponse[];
  addVideoResponse: (response: VideoResponse) => void;
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  resetApplication: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider = ({ children }: ApplicationProviderProps) => {
  const [status, setStatus] = useState<ApplicationStatus>('initial');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [videoResponses, setVideoResponses] = useState<VideoResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [customerName, setCustomerName] = useState('');

  const addDocument = (document: Document) => {
    setDocuments([...documents, document]);
  };

  const updateDocument = (index: number, document: Partial<Document>) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = { ...updatedDocuments[index], ...document };
    setDocuments(updatedDocuments);
  };

  const addVideoResponse = (response: VideoResponse) => {
    setVideoResponses([...videoResponses, response]);
  };

  const resetApplication = () => {
    setStatus('initial');
    setDocuments([]);
    setVideoResponses([]);
    setCurrentQuestion(0);
    setCustomerName('');
  };

  return (
    <ApplicationContext.Provider
      value={{
        status,
        setStatus,
        documents,
        addDocument,
        updateDocument,
        videoResponses,
        addVideoResponse,
        currentQuestion,
        setCurrentQuestion,
        customerName,
        setCustomerName,
        resetApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
