
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MainLayout from '@/layouts/MainLayout';
import { useApplication } from '@/contexts/ApplicationContext';
import VideoManager from '@/components/VideoManager';
import DocumentUpload from '@/components/DocumentUpload';
import ApplicationStatus from '@/components/ApplicationStatus';
import LoanAssistant from '@/components/LoanAssistant';

export default function Index() {
  const { status, setStatus } = useApplication();
  const [activeTab, setActiveTab] = useState<string>(status === 'initial' ? 'start' : status);

  // Update active tab when application status changes
  useEffect(() => {
    if (status !== 'initial') {
      setActiveTab(status);
    }
  }, [status]);

  // Update application status when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Only change application status for certain tabs
    if (['video_intro', 'document_upload', 'video_questions', 'processing'].includes(value)) {
      setStatus(value as any);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Finesse Bank Loan Application</h1>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="start" disabled={status !== 'initial'}>Start</TabsTrigger>
            <TabsTrigger value="video_intro" disabled={status === 'initial'}>Introduction</TabsTrigger>
            <TabsTrigger value="document_upload" disabled={!['document_upload', 'video_questions', 'processing', 'approved', 'rejected', 'more_info'].includes(status)}>Documents</TabsTrigger>
            <TabsTrigger value="video_questions" disabled={!['video_questions', 'processing', 'approved', 'rejected', 'more_info'].includes(status)}>Interview</TabsTrigger>
            <TabsTrigger value="processing" disabled={!['processing', 'approved', 'rejected', 'more_info'].includes(status)}>Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="start" className="mt-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Welcome to the Finesse Bank Loan Application</h2>
              <p className="mb-6">
                We're excited to help you with your loan needs. Our application process is simple and straightforward.
              </p>
              <button 
                onClick={() => setStatus('video_intro')} 
                className="bg-finesse-600 hover:bg-finesse-700 text-white py-2 px-6 rounded-md transition-colors"
              >
                Start Application
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="video_intro" className="mt-6">
            <VideoManager />
          </TabsContent>
          
          <TabsContent value="document_upload" className="mt-6">
            <DocumentUpload />
          </TabsContent>
          
          <TabsContent value="video_questions" className="mt-6">
            <VideoManager />
          </TabsContent>
          
          <TabsContent value="processing" className="mt-6">
            <ApplicationStatus />
          </TabsContent>

          <TabsContent value="loan_assistant" className="mt-6">
            <LoanAssistant />
          </TabsContent>
        </Tabs>
        
        {/* Add Loan Assistant section below the main application flow */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Need Help with Your Loan?</h2>
          <LoanAssistant />
        </div>
      </div>
    </MainLayout>
  );
}
