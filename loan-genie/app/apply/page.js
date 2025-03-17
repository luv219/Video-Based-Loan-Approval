"use client"; // Required for client-side hooks

import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Apply() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isSignedIn) return null; // Prevents UI flickering

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold">Apply for a Loan</h2>
        <p className="text-gray-600 mt-2">Complete the application with AI-powered guidance.</p>
        <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md">
          Start Video Application
        </button>
      </div>
    </div>
  );
}
