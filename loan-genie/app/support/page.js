"use client";

import { useState, useRef } from "react";
import Navbar from "../components/Navbar";

export default function Support() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const videoRef = useRef(null);
  
  const queryAnswers = {
    "cibil score": "CIBILScore.mp4",
    "late payment": "LatePayment.mp4",
    "loan eligibility": "LoanEligibility.mp4",
    "loan interest rate": "LoanRate.mp4",
    "secure loan vs unsecure loan": "SecureVsUnsecureLoan.mp4",
    "types of loans": "TypesOfLoans.mp4"
  };

  const handleQuery = () => {
    const userQuery = document.getElementById("queryInput").value.toLowerCase();
    playMatchingVideo(userQuery);
  };

  const playMatchingVideo = (userQuery) => {
    let matchedVideo = null;
    
    for (let key in queryAnswers) {
      if (userQuery.includes(key)) {
        matchedVideo = queryAnswers[key];
        break;
      }
    }
    
    if (matchedVideo) {
      setErrorMessage(false);
      setVideoSrc(`Videos/Answer Videos/${matchedVideo}`);
      // Use a setTimeout to ensure the src is updated before trying to play
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play();
        }
      }, 0);
    } else {
      setErrorMessage(true);
      setVideoSrc(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-10">
        <h2 className="text-3xl font-bold">Support & FAQs</h2>
        <p className="text-gray-600 mt-2">Need help? Contact support or browse our FAQs.</p>
        
        {/* Query section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Ask a Question</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              id="queryInput"
              type="text"
              placeholder="Type your question here (e.g., 'cibil score', 'loan eligibility')"
              className="border p-2 rounded w-full md:w-96"
            />
            <button
              onClick={handleQuery}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          
          {/* Video player - only show when there's a source */}
          <div className="mt-6">
            {videoSrc ? (
              <video 
                ref={videoRef}
                id="avatarVideo" 
                controls 
                className="w-full max-w-2xl rounded shadow-lg"
              >
                <source id="videoSource" src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full max-w-2xl h-64 bg-gray-100 rounded shadow-lg flex items-center justify-center">
                <p className="text-gray-500">Search for a topic to see a video explanation</p>
              </div>
            )}
            
            {/* Error message */}
            {errorMessage && (
              <div id="errorMessage" className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                Sorry, we couldn't find a video that answers your question. Please try a different query.
              </div>
            )}
          </div>
        </div>
        
        {/* FAQ topics */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Suggested Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(queryAnswers).map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  document.getElementById("queryInput").value = topic;
                  handleQuery();
                }}
                className="p-3 border rounded hover:bg-gray-100 text-left capitalize"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
