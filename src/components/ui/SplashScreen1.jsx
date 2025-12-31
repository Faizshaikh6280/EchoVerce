import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "/images/logo.png";

const SplashScreen1 = ({ onComplete }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(false); // Controls sequencing

  // 1. Sequence Manager: Wait for Logo Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true); // Show loader after 1s (logo animation done)
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Progress Manager: Runs only when showLoader is true
  useEffect(() => {
    if (!showLoader) return; // Don't start until logo is ready

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40); // Slightly faster to compensate for the initial delay

    // Navigate when complete
    if (progress === 100) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }

    return () => clearInterval(interval);
  }, [showLoader, progress, navigate, onComplete]);

  return (
    <div className="bg-accent min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Content Container */}
      <div className="z-10 flex flex-col items-center gap-6 p-4">
        {/* Logo Section - Bounces In on Mount */}
        <div className="flex flex-col items-center gap-2 animate-bounce-in">
          <img
            src={logoImg}
            alt="Echo Verce"
            className="w-64 md:w-80 object-contain drop-shadow-lg"
          />
          <h2 className="font-primary text-dark-accent text-xl md:text-2xl text-center tracking-wide">
            BRINGING DIGITAL PERSONALITIES TO LIFE
          </h2>
        </div>

        {/* Loading Area - Hidden until logo finishes, then Fades In */}
        <div
          className={`mt-12 relative w-64 md:w-80 transition-opacity duration-500 ${
            showLoader ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar Container */}
          <div className="h-4 border-2 border-dark-accent rounded-full overflow-hidden bg-transparent p-[2px]">
            <div
              className="h-full bg-dark-accent rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Glitter Particles (Only render if loader is showing) */}
          {showLoader && (
            <>
              <GlitterParticle top="-15px" left="10%" delay="0s" />
              <GlitterParticle top="20px" left="20%" delay="0.5s" />
              <GlitterParticle top="-10px" left="50%" delay="0.2s" />
              <GlitterParticle top="25px" left="80%" delay="0.7s" />
              <GlitterParticle top="-20px" left="90%" delay="1s" />
              <GlitterParticle top="10px" left="5%" delay="1.2s" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Glitter
const GlitterParticle = ({ top, left, delay }) => {
  return (
    <div
      className="absolute w-2 h-2 bg-dark-accent rounded-full animate-twinkle"
      style={{
        top: top,
        left: left,
        animationDelay: delay,
      }}
    />
  );
};

export default SplashScreen1;
