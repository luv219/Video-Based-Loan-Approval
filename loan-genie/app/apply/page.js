"use client"; // Required for client-side hooks

import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Apply() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, isLoaded, router]);

  const handleEligibilityCheck = (e) => {
    e.preventDefault();
    
    // Form validation
    const income = document.getElementById("ApplicantIncome").value;
    if (income == 0) {
      setResultMessage("Error: Applicant income cannot be zero. You are not eligible.");
      setShowResult(true);
      setIsEligible(false);
      return;
    }
    
    // Simple eligibility check logic
    // In a real application, this would be a backend API call
    const creditScore = parseInt(document.getElementById("credit").value);
    const applicantIncome = parseInt(document.getElementById("ApplicantIncome").value);
    const loanAmount = parseInt(document.getElementById("LoanAmount").value);
    
    // Example eligibility criteria
    if (creditScore > 650 && loanAmount <= applicantIncome * 5 && applicantIncome > 30000) {
      setResultMessage("Congratulations! You are eligible for the loan. Please proceed with the video application.");
      setIsEligible(true);
    } else {
      setResultMessage("Sorry, you are not eligible for the loan at this time. Please review our eligibility criteria.");
      setIsEligible(false);
    }
    
    setShowResult(true);
    setEligibilityChecked(true);
  };

  const startVideoApplication = () => {
    // Here you would implement the logic to start the video application
    alert("Starting video application process...");
    // Redirect to video application page or open a modal
  };

  if (!isSignedIn) return null; // Prevents UI flickering

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-bold">Apply for a Loan</h2>
        <p className="text-gray mt-2">Complete the application with AI-powered guidance.</p>
        
        {!eligibilityChecked && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Loan Eligibility Checker</h3>
            <p className="text-gray mb-4">Please check your eligibility before proceeding.</p>
            
            <form className="mt-3" onSubmit={handleEligibilityCheck}>
              <div className="mb-3">
                <label htmlFor="gender" className="block text-sm font-medium">Gender</label>
                <select id="gender" name="gender" className="mt-1 block w-full rounded-md focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="" disabled selected>-- Select --</option>
                  <option value="Male" className="text-black">Male</option>
                  <option value="Female" className="text-black">Female</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="married" className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select id="married" name="married" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="" disabled selected>-- Select --</option>
                  <option value="Yes" className="text-black">Married</option>
                  <option value="No" className="text-black">Single</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="dependents" className="block text-sm font-medium text-gray-700">Dependents</label>
                <select id="dependents" name="dependents" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="" disabled selected>-- Select --</option>
                  <option value="0" className="text-black">0</option>
                  <option value="1" className="text-black">1</option>
                  <option value="2" className="text-black">2</option>
                  <option value="2+" className="text-black">2+</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
                <select id="education" name="education" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="" disabled selected>-- Select --</option>
                  <option value="Graduate" className="text-black">Graduate</option>
                  <option value="Not Graduate" className="text-black">Not Graduate</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="residence" className="block text-sm font-medium text-gray-700">Area of Residence</label>
                <select id="residence" name="residence" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="" disabled selected>-- Select --</option>
                  <option value="Urban" className="text-black">Urban</option>
                  <option value="Semiurban" className="text-black">Semiurban</option>
                  <option value="Rural" className="text-black">Rural</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="credit" className="block text-sm font-medium text-gray-700">Credit Score (0-900)</label>
                <input type="number" id="credit" name="credit" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" min="0" max="900" required />
              </div>
              
              <div className="mb-3">
                <label htmlFor="ApplicantIncome" className="block text-sm font-medium text-gray-700">Applicant Income</label>
                <input type="number" id="ApplicantIncome" name="ApplicantIncome" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
              </div>
              
              <div className="mb-3">
                <label htmlFor="LoanAmount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
                <input type="number" id="LoanAmount" name="LoanAmount" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
              </div>
              
              <div className="mb-3">
                <label htmlFor="LoanTerm" className="block text-sm font-medium text-gray-700">Loan Term (in months)</label>
                <select id="LoanTerm" name="LoanTerm" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                  <option value="" disabled selected>-- Select --</option>
                  <option value="12" className="text-black">12 months</option>
                  <option value="24" className="text-black">24 months</option>
                  <option value="36" className="text-black">36 months</option>
                  <option value="60" className="text-black">60 months</option>
                  <option value="84" className="text-black">84 months</option>
                  <option value="120" className="text-black">120 months</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">Check Eligibility</button>
            </form>
          </div>
        )}
        
        {showResult && (
          <div className={`mt-6 p-4 rounded-md ${isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">{resultMessage}</p>
            
            {isEligible && (
              <button 
                onClick={startVideoApplication}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Start Video Application
              </button>
            )}
            
            {!isEligible && (
              <button 
                onClick={() => {
                  setEligibilityChecked(false);
                  setShowResult(false);
                }}
                className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}