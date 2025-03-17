"use client"; // Necessary for Clerk's hooks & authentication

import Link from "next/link";
import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">AI Branch Manager</h1>
      <div>
        <Link href="/" className="mr-4">Home</Link>
        <Link href="/apply" className="mr-4">Apply</Link>
        <Link href="/dashboard" className="mr-4">Dashboard</Link>
        <Link href="/support">Support</Link>
      </div>
      <div>
        <SignedOut>
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
