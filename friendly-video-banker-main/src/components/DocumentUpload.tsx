import React, { useState, useRef } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { DocumentType, processDocument, validateDocument } from '@/utils/documentUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Check, AlertTriangle, Loader2, MoveRight } from 'lucide-react';

const DocumentUpload: React.FC = () => {
  const { toast } = useToast();
  const { addDocument, setStatus } = useApplication();
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentDocType, setCurrentDocType] = useState<DocumentType>('aadhaar');
  const [uploadedDocs, setUploadedDocs] = useState<Record<DocumentType, boolean>>({
    aadhaar: false,
    pan: false,
    income_proof: false,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setProcessing(true);
    
    try {
      // Validate the file
      const validation = await validateDocument(file, currentDocType);
      
      if (!validation.isValid) {
        toast({
          title: "Invalid Document",
          description: validation.message,
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }
      
      // Process the document
      const details = await processDocument(file, currentDocType);
      
      // Add the document to the application context
      addDocument({
        type: currentDocType,
        file,
        status: 'verified',
        details: details as Record<string, string>,
      });
      
      // Update the uploaded documents state
      setUploadedDocs({
        ...uploadedDocs,
        [currentDocType]: true,
      });
      
      toast({
        title: "Document Uploaded",
        description: `Your ${getDocumentName(currentDocType)} has been successfully processed.`,
      });
      
      // Move to the next document type if available
      if (currentDocType === 'aadhaar') {
        setCurrentDocType('pan');
      } else if (currentDocType === 'pan') {
        setCurrentDocType('income_proof');
      }
      
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getDocumentName = (type: DocumentType): string => {
    switch (type) {
      case 'aadhaar':
        return 'Aadhaar Card';
      case 'pan':
        return 'PAN Card';
      case 'income_proof':
        return 'Income Proof';
      default:
        return 'Document';
    }
  };

  const handleContinue = () => {
    if (Object.values(uploadedDocs).every(Boolean)) {
      setStatus('video_questions');
    } else {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents before continuing.",
        variant: "destructive",
      });
    }
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="mx-auto max-w-3xl glass-card p-6 animate-slide-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-medium mb-2">Document Upload</h2>
        <p className="text-muted-foreground">
          Please upload the following documents to continue with your loan application.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {(['aadhaar', 'pan', 'income_proof'] as DocumentType[]).map((type) => (
          <button
            key={type}
            onClick={() => setCurrentDocType(type)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all ${
              currentDocType === type
                ? 'bg-finesse-50 border-2 border-finesse-300'
                : 'bg-white/40 hover:bg-white/60 border border-gray-200'
            } ${uploadedDocs[type] ? 'ring-2 ring-green-500/20' : ''}`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full mb-2 bg-white shadow-sm">
              {uploadedDocs[type] ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <FileText className="w-5 h-5 text-finesse-500" />
              )}
            </div>
            <span className="text-sm font-medium">{getDocumentName(type)}</span>
            {uploadedDocs[type] && (
              <span className="text-xs text-green-600 mt-1">Verified</span>
            )}
          </button>
        ))}
      </div>

      <div
        className={`upload-area mb-6 ${dragging ? 'dragging' : ''} ${
          processing ? 'opacity-70 pointer-events-none' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-finesse-50 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-finesse-500" />
          </div>
          
          <h3 className="text-lg font-medium mb-1">Upload your {getDocumentName(currentDocType)}</h3>
          
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Drag and drop your file here, or click to browse
          </p>
          
          {processing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-finesse-500 animate-spin mr-2" />
              <span>Processing document...</span>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleSelectFile}
              className="bg-finesse-600 hover:bg-finesse-700 text-white"
            >
              Select File
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {Object.values(uploadedDocs).filter(Boolean).length} of 3 documents uploaded
        </div>
        
        <Button
          onClick={handleContinue}
          disabled={!Object.values(uploadedDocs).every(Boolean)}
          className="bg-finesse-600 hover:bg-finesse-700 text-white disabled:bg-gray-300"
        >
          Continue to Questions
          <MoveRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default DocumentUpload;
