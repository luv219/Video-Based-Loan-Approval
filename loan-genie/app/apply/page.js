"use client"; // Required for client-side hooks

import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Apply() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [applicationMode, setApplicationMode] = useState(null); // 'manual' or 'video'
  
  // Video application states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [setRecordedChunks] = useState([]);
  const [userAnswerText, setUserAnswerText] = useState("Your answer will appear here...");
  const [userStream, setUserStream] = useState(null);
  const [showQuery, setShowQuery] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Refs for direct DOM access
  const userWebcamRef = useRef(null);
  const avatarVideoRef = useRef(null);

  // Questions for video application
  const questions = [
    { video: "Q_Contact.mp4", question: "What is your contact information?" },
    { video: "Q_EmploymentType.mp4", question: "Are you salaried or self-employed?" },
    { video: "Q_LoanAmount.mp4", question: "What loan amount are you applying for?" },
    { video: "Q_LoanTenure.mp4", question: "What is the tenure of the loan in years?" },
    { video: "Q_LoanType.mp4", question: "What type of loan are you applying for?" },
    { video: "Q_MonthlyIncome.mp4", question: "What is your monthly income?" }
  ];

  // Query answers mapping
  const queryAnswers = {
    "cibil score": "CIBILScore.mp4",
    "late payment": "LatePayment.mp4",
    "loan eligibility": "LoanEligibility.mp4",
    "loan interest rate": "LoanRate.mp4",
    "secure loan vs unsecure loan": "SecureVsUnsecureLoan.mp4",
    "types of loans": "TypesOfLoans.mp4"
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }

    // Clean up function for video streams
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isSignedIn, isLoaded, router, userStream]);

  // Initialize webcam as soon as video mode is selected
  useEffect(() => {
    if (applicationMode === 'video') {
      initWebcam();
    }
  }, [applicationMode]);

  // Initialize webcam
  const initWebcam = async () => {
    try {
      // Request both video and audio permissions right away
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: true 
      });
      
      setUserStream(stream);
      
      // Set the stream to the video element using ref
      if (userWebcamRef.current) {
        userWebcamRef.current.srcObject = stream;
        
        // Make sure video autoplays and shows live preview
        userWebcamRef.current.onloadedmetadata = () => {
          userWebcamRef.current.play().catch(e => console.error("Error playing user webcam:", e));
        };
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setUserAnswerText("Error: Unable to access camera or microphone. Please check your permissions.");
    }
  };

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

  const resetForm = () => {
    setEligibilityChecked(false);
    setShowResult(false);
    setApplicationMode(null);
    setCurrentQuestionIndex(0);
    setShowQuery(false);
    setQueryInput("");
    setErrorMessage("");
    setUserAnswerText("Your answer will appear here...");
    
    // Stop any active streams
    if (userStream) {
      userStream.getTracks().forEach(track => track.stop());
      setUserStream(null);
    }
    
    // Reset recording state
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setMediaRecorder(null);
    setRecordedChunks([]);
    setIsRecording(false);
  };

  // Function to play video
  const playVideo = (folder, videoName) => {
    return new Promise((resolve) => {
      if (!avatarVideoRef.current) {
        resolve();
        return;
      }
      
      // Using ref instead of getElementById
      const videoElement = avatarVideoRef.current;
      const videoSource = videoElement.querySelector('source');
      
      videoSource.src = `Videos/${folder}/${videoName}`;
      videoElement.load();
      
      videoElement.onended = () => {
        resolve();
      };
      
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error);
        resolve();
      });
    });
  };

  // Start video application
  const startVideoApplication = async () => {
    setApplicationMode('video');
    setEligibilityChecked(false);
    setShowResult(false);
    
    // Play intro video after a short delay to allow webcam to initialize
    setTimeout(async () => {
      await playVideo("Intro", "intro.mp4");
      playNextQuestion();
    }, 1000);
  };

  // Play next question in video application
  const playNextQuestion = async () => {
    if (currentQuestionIndex < questions.length) {
      let questionVideo = questions[currentQuestionIndex].video;
      await playVideo("Question Videos", questionVideo);
    } else {
      await playVideo("Intro", "query.mp4");
      setUserAnswerText("All questions answered! Ask any query now.");
      setShowQuery(true);
    }
  };

  // Start recording user's answer
  const startRecording = async () => {
    try {
      if (!userStream) {
        await initWebcam();
      }
      
      const recorder = new MediaRecorder(userStream);
      setMediaRecorder(recorder);
      
      const chunks = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
        setRecordedChunks([...chunks]);
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setUserAnswerText("Error: Unable to start recording. Please check your camera and microphone permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Simulate backend response
      setTimeout(() => {
        setUserAnswerText(`Answer: Recorded for "${questions[currentQuestionIndex].question}"`);
        
        // Move to next question
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setTimeout(playNextQuestion, 2000);
      }, 1000);
    }
  };

  // Handle query input
  const handleQuery = () => {
    let matchedVideo = null;
    setErrorMessage("");
    
    for (let key in queryAnswers) {
      if (queryInput.toLowerCase().includes(key)) {
        matchedVideo = queryAnswers[key];
        break;
      }
    }
    
    if (matchedVideo) {
      playVideo("Answer Videos", matchedVideo);
    } else {
      setErrorMessage("Sorry, I don't have an answer for that.");
    }
  };

  if (!isLoaded || !isSignedIn) return null; // Prevents UI flickering

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-bold">Apply for a Loan</h2>
        <p className="text-gray mt-2">Complete the application with AI-powered guidance.</p>
        
        {/* Application mode selection */}
        {!applicationMode && !eligibilityChecked && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Choose Application Method</h3>
            <div className="mt-4 flex gap-4">
              <button 
                onClick={() => setApplicationMode('manual')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Manual Eligibility Check
              </button>
              <button 
                onClick={startVideoApplication}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300"
              >
                Video Application
              </button>
            </div>
          </div>
        )}
        
        {/* Manual Eligibility Form */}
        {applicationMode === 'manual' && !eligibilityChecked && (
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
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                  Check Eligibility
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Video Application UI */}
        {applicationMode === 'video' && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Video Application</h3>
            <p className="text-gray mb-4">Answer the questions to complete your application.</p>
            
            <div className="my-4 flex flex-col md:flex-row gap-4">
              {/* Avatar Video */}
              <div className="flex-1">
                <p className="mb-2 font-medium">AI Assistant</p>
                <video 
                  ref={avatarVideoRef}
                  className="w-full rounded-md border-2 border-blue-300" 
                  playsInline 
                  autoPlay
                >
                  <source src="Videos/Intro/intro.mp4" type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              </div>
              
              {/* User's Webcam - Now with live preview */}
              <div className="flex-1">
                <p className="mb-2 font-medium">You {isRecording && <span className="text-red-500">(Recording)</span>}</p>
                <video 
                  ref={userWebcamRef}
                  className={`w-full rounded-md ${isRecording ? 'border-2 border-red-500 pulse-recording' : 'border-2 border-green-300'}`}
                  playsInline 
                  autoPlay 
                  muted
                >
                  Your browser does not support video playback.
                </video>
                {!userStream && <p className="text-sm text-center mt-2">Initializing camera...</p>}
              </div>
            </div>
            
            <div className="my-4">
              <h4 className="font-medium">Your Response:</h4>
              <p id="userAnswer" className="p-2 bg-gray-100 rounded-md">{userAnswerText}</p>
            </div>
            
            {/* Recording Controls */}
            {!showQuery && (
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={startRecording}
                  disabled={isRecording || !userStream}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
                >
                  Start Answering
                </button>
                <button 
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
                >
                  Submit Answer
                </button>
              </div>
            )}
            
            {/* Query Input */}
            {showQuery && (
              <div className="mt-4">
                <h4 className="font-medium">Ask a Loan-related Question:</h4>
                <div className="flex gap-2 mt-2">
                  <input 
                    type="text" 
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Type your question..."
                  />
                  <button 
                    onClick={handleQuery}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Ask
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-red-500 mt-2">{errorMessage}</p>
                )}
              </div>
            )}
            
            <button 
              onClick={resetForm}
              className="mt-6 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Back to Options
            </button>
          </div>
        )}
        
        {/* Eligibility Result */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-md ${isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">{resultMessage}</p>
            
            <div className="mt-4 flex gap-4">
              {isEligible && (
                <button 
                  onClick={startVideoApplication}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Start Video Application
                </button>
              )}
              
              <button 
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
              >
                {isEligible ? "Back to Options" : "Try Again"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add some custom CSS for the recording indicator */}
      <style jsx>{`
        @keyframes pulse {
          0% { border-color: rgba(239, 68, 68, 0.7); }
          50% { border-color: rgba(239, 68, 68, 1); }
          100% { border-color: rgba(239, 68, 68, 0.7); }
        }
        
        .pulse-recording {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}