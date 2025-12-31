import React from "react";
import { useNavigate } from "react-router-dom";
// Replace these with your correct asset paths
import headerImage from "/images/splashbg.png";
import logoImage from "/images/logo.png";

const SplashScreen2 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a103c] relative overflow-hidden">
      {/* Header Section Container */}
      <div className="w-full flex-grow-0 relative">
        {/* LOGO LAYER (Positioned on top & Animated) */}
        <div className="absolute top-12 left-0 w-full flex justify-center z-20">
          <img
            src={logoImage}
            alt="App Logo"
            // Applied the new 'camera-zoom' animation class
            className="h-20 w-auto object-contain drop-shadow-xl animate-camera-zoom"
          />
        </div>

        {/* Header Background Image */}
        <img
          src={headerImage}
          alt="Echo Verce Stage with Characters"
          className="w-full h-[55vh] sm:h-[60vh] object-cover pointer-events-none"
        />

        {/* Gradient overlay for smoother transition */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#1a103c] via-[#1a103c]/60 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col items-center justify-start pt-2 px-6 pb-12 text-center relative z-10">
        {/* Main Title */}
        <h1 className="font-primary font-light text-white text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight drop-shadow-lg">
          TALK, SING, & VIBE WITH AI
        </h1>

        {/* Subtitle */}
        <p className="font-secondary text-white/80 text-lg sm:text-xl mb-10 max-w-md drop-shadow-md">
          Experience real-time interaction with your favorite personalities.
          Your mood drives the conversation.
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate("/app", { replace: true })}
          className="w-full sm:w-auto font-light cursor-pointer sm:px-12 py-4 bg-gradient-to-r from-[#e2a5f0] to-[#c77dff] rounded-full font-primary text-xl text-white shadow-[0_0_20px_rgba(226,165,240,0.6)] hover:shadow-[0_0_30px_rgba(226,165,240,0.8)] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Choose Your Partner
        </button>
      </div>
    </div>
  );
};

export default SplashScreen2;
