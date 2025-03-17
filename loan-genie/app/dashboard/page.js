"use client";

import Navbar from "../components/Navbar";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div>
      <Navbar />
      <div className="p-10">
        <h2 className="text-3xl font-bold">Your Loan Status</h2>
        <p className="text-gray-600 mt-2">Track your loan application progress.</p>
        {user && <p className="mt-4 text-lg">Welcome, {user.fullName}!</p>}
      </div>
    </div>
  );
}
