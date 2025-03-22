
import React, { useState, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { checkLoanEligibility } from '@/utils/documentUtils';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const ApplicationStatus: React.FC = () => {
  const { documents, videoResponses, status, setStatus } = useApplication();
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    status: 'approved' | 'rejected' | 'more_info';
    message: string;
    approvedAmount?: number;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    let interval: number | null = null;
    
    if (status === 'processing') {
      setProgress(0);
      interval = window.setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval as number);
            processApplication();
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const processApplication = async () => {
    try {
      const eligibilityResult = await checkLoanEligibility(documents, videoResponses);
      setResult(eligibilityResult);
      setStatus(eligibilityResult.status);
    } catch (error) {
      console.error('Error processing application:', error);
      setResult({
        status: 'more_info',
        message: 'There was an error processing your application. Please try again later.'
      });
      setStatus('more_info');
    }
  };

  const renderStatusIcon = () => {
    if (!result) return null;
    
    switch (result.status) {
      case 'approved':
        return (
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4 mx-auto">
            <CheckCircle className="w-12 h-12 text-approved" />
          </div>
        );
      case 'rejected':
        return (
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
            <XCircle className="w-12 h-12 text-rejected" />
          </div>
        );
      case 'more_info':
        return (
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-12 h-12 text-pending" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderStatusContent = () => {
    if (status === 'processing') {
      return (
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-medium mb-4">Processing Your Application</h2>
          <p className="text-muted-foreground mb-6">
            Please wait while we evaluate your loan application...
          </p>
          <div className="max-w-md mx-auto mb-6">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Analyzing documents</span>
              <span>{progress}%</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-finesse-500 animate-spin mr-2" />
            <span className="text-sm">This will only take a moment</span>
          </div>
        </div>
      );
    }
    
    if (result) {
      return (
        <div className="text-center animate-fade-in">
          {renderStatusIcon()}
          
          <h2 className="text-2xl font-medium mb-2">
            {result.status === 'approved' && 'Loan Approved!'}
            {result.status === 'rejected' && 'Loan Application Declined'}
            {result.status === 'more_info' && 'Additional Information Required'}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {result.message}
          </p>
          
          {result.status === 'approved' && result.approvedAmount && (
            <div className="bg-green-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Approved Loan Amount</h3>
              <p className="text-3xl font-bold text-finesse-800">₹{result.approvedAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your loan has been pre-approved. A bank representative will contact you shortly.
              </p>
            </div>
          )}
          
          {result.status === 'rejected' && result.reason && (
            <div className="bg-red-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Reason</h3>
              <p className="text-muted-foreground">{result.reason}</p>
            </div>
          )}
          
          {result.status === 'more_info' && (
            <div className="bg-amber-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Next Steps</h3>
              <p className="text-muted-foreground mb-4">
                We need additional information to process your application. A bank representative will contact you shortly.
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => window.location.reload()}
            className="bg-finesse-600 hover:bg-finesse-700 text-white"
          >
            Start a New Application
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="mx-auto max-w-3xl glass-card p-8 animate-slide-up">
      {renderStatusContent()}
    </Card>
  );
};

export default ApplicationStatus;
