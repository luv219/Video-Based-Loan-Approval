import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-blue-700">Welcome to AI Branch Manager</h1>
        <p className="text-lg text-gray-600 mt-4">Apply for loans seamlessly with AI-powered assistance.</p>
        <a href="/apply" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md">
          Get Started
        </a>
      </div>
    </div>
  );
}
