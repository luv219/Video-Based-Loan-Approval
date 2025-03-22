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
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [userAnswerText, setUserAnswerText] = useState("Your answer will appear here...");
  const [userStream, setUserStream] = useState(null);
  const [showQuery, setShowQuery] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Document verification states
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentProcessing, setDocumentProcessing] = useState(false);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [extractedDocumentText, setExtractedDocumentText] = useState("");
  
  // Video transcription states
  const [transcriptionActive, setTranscriptionActive] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  
  // Refs for direct DOM access
  const userWebcamRef = useRef(null);
  const avatarVideoRef = useRef(null);
  const fileInputRef = useRef(null);
  const transcriptionRef = useRef(null);

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
      
      // Stop speech recognition if active
      if (transcriptionActive && window.speechRecognition) {
        window.speechRecognition.stop();
      }
    };
  }, [isSignedIn, isLoaded, router, userStream, transcriptionActive]);

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
    setDocumentUploaded(false);
    setDocumentProcessing(false);
    setDocumentVerified(false);
    setExtractedDocumentText("");
    setTranscriptionActive(false);
    setTranscriptionText("");
    
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
    
    // Stop speech recognition if active
    if (transcriptionActive && window.speechRecognition) {
      window.speechRecognition.stop();
    }
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
      
      // Start speech recognition for this recording
      startSpeechRecognition();
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
      
      // Stop speech recognition
      if (window.speechRecognition) {
        window.speechRecognition.stop();
        setTranscriptionActive(false);
      }
      
      // Update user answer text with transcription
      setUserAnswerText(`Answer: ${transcriptionText || "Recorded"} for "${questions[currentQuestionIndex].question}"`);
      
      // Move to next question
      setTimeout(() => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setTranscriptionText(""); // Reset transcription for next question
        setTimeout(playNextQuestion, 1000);
      }, 1500);
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
  
  // Document processing functions
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setDocumentUploaded(true);
    setDocumentProcessing(true);
    
    // Simulate document processing
    setTimeout(() => {
      // In a real application, this would call a backend API to process the image
      // using the OpenCV and Tesseract functionality
      const simulatedExtractedText = `
ID Type: Aadhaar Card
Number: XXXX XXXX XXXX
Name: ${document.getElementById("name")?.value || "Sample User"}
DOB: 01/01/1990
Gender: ${document.getElementById("gender")?.value || "Male"}
Address: 123 Sample Street, City, State - 123456
      `.trim();
      
      setExtractedDocumentText(simulatedExtractedText);
      setDocumentProcessing(false);
      setDocumentVerified(true);
    }, 2000);
  };
  
  // Speech recognition for video transcription
  const startSpeechRecognition = () => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      console.error("Speech Recognition is not supported in this browser.");
      return;
    }
    
    // Create a new speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure speech recognition
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Store in window to allow stopping in cleanup
    window.speechRecognition = recognition;
    
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setTranscriptionText(transcript);
    };
    
    recognition.start();
    setTranscriptionActive(true);
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
        
        {/* Document Verification Section */}
        {(applicationMode === 'manual' || applicationMode === 'video') && !documentVerified && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-xl font-semibold">ID Verification</h3>
            <p className="text-gray mb-4">Upload your ID document (Aadhaar Card, PAN, etc.) for verification.</p>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleDocumentUpload}
                />
              </label>
            </div>
            
            {documentUploaded && (
              <div className="mt-4">
                {documentProcessing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing document...</span>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-md">
                    <h4 className="font-medium text-green-800">Document Verified Successfully</h4>
                    <pre className="mt-2 bg-white p-3 rounded-md text-xs overflow-x-auto">
                      {extractedDocumentText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Manual Eligibility Form */}
        {applicationMode === 'manual' && !eligibilityChecked && documentVerified && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Loan Eligibility Checker</h3>
            <p className="text-gray mb-4">Please check your eligibility before proceeding.</p>
            
            <form className="mt-3" onSubmit={handleEligibilityCheck}>
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                <input type="text" id="name" name="name" className="mt-1 block w-full rounded-md focus:border-blue-500 focus:ring-blue-500" required />
              </div>
              
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
        {applicationMode === 'video' && documentVerified && (
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
            
            {/* Speech-to-Text Transcription */}
            <div className="my-4">
              <h4 className="font-medium">Your Response:</h4>
              <textarea
                ref={transcriptionRef}
                className="p-2 bg-gray-100 rounded-md w-full min-h-16"
                value={transcriptionText || "Your answer will appear here..."}
                readOnly
              />
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