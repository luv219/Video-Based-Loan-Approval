
// Mock document processing functions
// In a real application, these would connect to OCR services or other APIs

export type DocumentType = 'aadhaar' | 'pan' | 'income_proof';

export interface DocumentDetails {
  name?: string;
  dob?: string;
  number?: string;
  address?: string;
  income?: string;
  employmentType?: string;
}

export const processDocument = async (
  file: File,
  type: DocumentType
): Promise<DocumentDetails> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real application, this would send the file to an OCR service
  // and process the results. Here, we return mock data based on type.
  
  switch (type) {
    case 'aadhaar':
      return {
        name: 'Sample User',
        dob: '1990-01-01',
        number: 'XXXX-XXXX-XXXX',
        address: '123 Sample Street, Sample City, 123456'
      };
    case 'pan':
      return {
        name: 'Sample User',
        dob: '1990-01-01',
        number: 'ABCDE1234F'
      };
    case 'income_proof':
      return {
        income: '75000',
        employmentType: 'Salaried'
      };
    default:
      return {};
  }
};

export const validateDocument = async (
  file: File,
  type: DocumentType
): Promise<{ isValid: boolean; message?: string }> => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: 'Invalid file type. Please upload an image (JPEG, PNG, WEBP) or PDF.' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: 'File is too large. Maximum file size is 5MB.' 
    };
  }
  
  // In a real application, further validation would be done
  // For now, we'll just return valid
  return { isValid: true };
};

// Eligibility check based on documents and video responses
export const checkLoanEligibility = async (
  documents: Array<{ type: DocumentType; details?: DocumentDetails }>,
  videoResponses: any[]
): Promise<{ 
  status: 'approved' | 'rejected' | 'more_info';
  message: string;
  approvedAmount?: number;
  reason?: string;
}> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock eligibility check - in a real application, this would use actual data
  const incomeProof = documents.find(doc => doc.type === 'income_proof');
  
  if (!incomeProof || !incomeProof.details) {
    return {
      status: 'more_info',
      message: 'We need more information about your income to process your application.'
    };
  }
  
  const income = parseInt(incomeProof.details.income || '0');
  
  if (income < 25000) {
    return {
      status: 'rejected',
      message: 'We regret to inform you that your loan application has been declined.',
      reason: 'Minimum income requirement not met.'
    };
  } else if (income >= 25000 && income < 50000) {
    return {
      status: 'approved',
      message: 'Congratulations! Your loan has been pre-approved.',
      approvedAmount: income * 10
    };
  } else {
    return {
      status: 'approved',
      message: 'Congratulations! Your loan has been pre-approved.',
      approvedAmount: income * 15
    };
  }
};
