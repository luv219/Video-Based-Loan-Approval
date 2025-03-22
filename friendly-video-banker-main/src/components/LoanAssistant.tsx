
import React from 'react';
import { Card } from '@/components/ui/card';
import AvatarManager from './video/AvatarManager';

const LoanAssistant: React.FC = () => {
  return (
    <Card className="mx-auto max-w-3xl glass-card p-6 animate-slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-finesse-800">Loan Assistant</h2>
        <p className="text-muted-foreground">
          Ask our AI assistant any questions about loans and applications
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Common Questions</h3>
          <ul className="space-y-2 text-sm">
            <li className="p-2 rounded bg-finesse-50 hover:bg-finesse-100 transition-colors">What are the current interest rates?</li>
            <li className="p-2 rounded bg-finesse-50 hover:bg-finesse-100 transition-colors">What documents are required for a loan?</li>
            <li className="p-2 rounded bg-finesse-50 hover:bg-finesse-100 transition-colors">How long does the approval process take?</li>
            <li className="p-2 rounded bg-finesse-50 hover:bg-finesse-100 transition-colors">What's the maximum loan amount available?</li>
            <li className="p-2 rounded bg-finesse-50 hover:bg-finesse-100 transition-colors">Are there any prepayment penalties?</li>
          </ul>
        </div>
        
        <div className="h-[400px]">
          <AvatarManager />
        </div>
      </div>
    </Card>
  );
};

export default LoanAssistant;
