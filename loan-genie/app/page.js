import Navbar from "./components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="flex items-center ">
          <h1 className="text-4xl font-bold text-blue-700">
            Welcome to Loan Genie
          </h1>
          <Image
            src="/genie.gif"
            width={150}
            height={80}
            alt="Genie"
            unoptimized
          />
        </div>
        <p className="text-lg text-gray-600 mt-4">
          Apply for loans seamlessly with AI-powered assistance.
        </p>
        <a
          href="/apply"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
