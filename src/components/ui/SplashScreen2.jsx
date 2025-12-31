import React from "react";
import { useNavigate } from "react-router-dom";
// Replace this with the correct path to your image file
import headerImage from "/images/splashbg.png";

const SplashScreen2 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a103c]">
      {/* Header Image */}
      <div className="w-full flex-grow-0">
        <img
          src={headerImage}
          alt="Echo Verce Stage with Characters"
          className="w-full h-[60vh] object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 pb-12 text-center">
        {/* Main Title */}
        <h1 className="font-primary text-white text-3xl font-light sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
          TALK, SING, & VIBE WITH AI
        </h1>

        {/* Subtitle */}
        <p className="font-secondary text-white/80 text-lg sm:text-xl mb-10 max-w-md">
          Experience real-time interaction with your favorite personalities.
          Your mood drives the conversation.
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate("/app", { replace: true })}
          className="w-full sm:w-auto cursor-pointer sm:px-12 py-4 bg-gradient-to-r from-[#e2a5f0] to-[#c77dff] rounded-full font-primary text-xl text-white shadow-[0_0_20px_rgba(226,165,240,0.6)] hover:shadow-[0_0_30px_rgba(226,165,240,0.8)] transition-shadow duration-300"
        >
          Choose Your Partner
        </button>
      </div>
    </div>
  );
};

export default SplashScreen2;
