
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Predefined responses for loan-related queries
const predefinedResponses: Record<string, string> = {
  "interest rates": "Our current interest rates range from 7.5% to 12.5% depending on your credit score, loan amount, and repayment term.",
  "loan term": "We offer flexible loan terms ranging from 1 to 7 years for personal loans, and up to 30 years for home loans.",
  "documents required": "You'll need to provide proof of identity (Aadhaar/PAN), proof of income (salary slips/IT returns), and address proof. Additional documents may be required based on your loan type.",
  "loan amount": "Personal loans range from ₹50,000 to ₹25 lakhs, while home loans can go up to ₹5 crores depending on your eligibility and property value.",
  "processing time": "Once all documents are verified, personal loans are typically processed within 48-72 hours, and home loans within 5-7 working days.",
  "processing fee": "The processing fee is 1-2% of the loan amount, subject to a minimum of ₹1,500 and maximum of ₹25,000.",
  "eligibility": "Eligibility depends on factors like age (21-65 years), income stability, credit score (700+), and existing financial obligations.",
  "repayment options": "We offer flexible repayment options including ECS, PDC, or direct debit from your bank account.",
  "prepayment": "Partial or full prepayment is allowed after 6 months from disbursement, with a nominal prepayment charge of 2-3% on the prepaid amount."
};

// Find the most relevant predefined response for a query
const findRelevantResponse = (query: string): string => {
  const lowercaseQuery = query.toLowerCase();
  
  // Direct match check
  for (const [keyword, response] of Object.entries(predefinedResponses)) {
    if (lowercaseQuery.includes(keyword)) {
      return response;
    }
  }
  
  // Return default response if no match
  return "I'm sorry, I don't have specific information about that. Please contact our customer service at support@finessebank.com for assistance with your query.";
};

const AvatarManager: React.FC = () => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<{ isUser: boolean; message: string }[]>([
    { isUser: false, message: "Hello! I'm your Finesse Bank virtual assistant. How can I help you with your loan-related questions today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user query to conversation
    setConversation((prev) => [...prev, { isUser: true, message: query }]);
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const response = findRelevantResponse(query);
      setConversation((prev) => [...prev, { isUser: false, message: response }]);
      setIsProcessing(false);
      setQuery('');
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="p-4 bg-finesse-600 text-white flex items-center">
        <Avatar className="h-10 w-10 mr-3 border-2 border-white">
          <AvatarImage src="/avatar.png" alt="AI Avatar" />
          <AvatarFallback className="bg-finesse-800 text-white">AI</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">Finesse AI Loan Assistant</h3>
          <p className="text-xs opacity-80">Ask me about loans and applications</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "300px" }}>
        {conversation.map((item, index) => (
          <div key={index} className={`flex ${item.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              item.isUser 
                ? 'bg-finesse-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {item.message}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleQuerySubmit} className="p-3 border-t border-gray-200 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about loan interest rates, terms, eligibility..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isProcessing || !query.trim()}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default AvatarManager;
