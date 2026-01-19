import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Smartphone, MonitorX } from "lucide-react"; // Icons for the modal
import Home from "./routes/Home.jsx";
import Avatars from "./routes/Avatars.jsx";
import Charachter from "./routes/Charachter.jsx";

export default function App() {
  // 1. State to track if screen is too large
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // 2. Logic to check window width
  useEffect(() => {
    const checkScreenSize = () => {
      // 768px is a standard breakpoint. Anything larger implies Tablet/Desktop.
      setIsLargeScreen(window.innerWidth > 768);
    };

    // Run immediately on load
    checkScreenSize();

    // Run whenever the user resizes the browser
    window.addEventListener("resize", checkScreenSize);

    // Cleanup listener to prevent memory leaks
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <>
      {/* --- MOBILE ONLY WARNING MODAL --- */}
      {isLargeScreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="bg-[#1a0b2e] border border-purple-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
              <div className="w-20 h-20 bg-[#2a1b3d] rounded-full flex items-center justify-center border border-purple-500/30 relative z-10">
                <Smartphone className="w-10 h-10 text-purple-400" />
                <div className="absolute -right-2 -bottom-2 bg-red-500 rounded-full p-1.5 border-4 border-[#1a0b2e]">
                  <MonitorX className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-3 font-sans tracking-tight">
              Mobile Experience Only
            </h2>

            <p className="text-gray-300 mb-8 leading-relaxed text-sm">
              Our AI characters are shy on big screens! 🙈
              <br />
              <br />
              This app is heavily optimized for mobile.
              <br />
              <span className="text-pink-400 font-bold">
                Please shrink your browser window
              </span>{" "}
              or switch to your phone to start vibing.
            </p>

            {/* Visual Guide Bar */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-widest">
              Waiting for resize...
            </p>
          </div>
        </div>
      )}

      {/* --- YOUR EXISTING ROUTES --- */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Avatars />} />
        <Route path="/app/:slug" element={<Charachter />} />
      </Routes>
    </>
  );
}
