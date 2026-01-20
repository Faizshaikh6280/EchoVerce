import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  Smartphone,
  MonitorX,
  Sparkles,
  Cpu,
  Zap,
  PlayCircle,
  MessageSquareHeart,
} from "lucide-react";
import Home from "./routes/Home.jsx";
import Avatars from "./routes/Avatars.jsx";
import Charachter from "./routes/Charachter.jsx";

export default function App() {
  const location = useLocation(); // Hook to detect route changes

  // 1. Mobile Check State
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // 2. Judges Modal State
  const [showJudgesModal, setShowJudgesModal] = useState(false);

  // --- LOGIC: Screen Size & Modal Triggers ---
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth > 768;
      setIsLargeScreen(isLarge);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // --- CHECK FOR JUDGES MODAL TRIGGER ---
    // Condition: On '/app' route AND hasn't seen intro AND is on mobile
    if (location.pathname.startsWith("/app")) {
      const hasSeenIntro = sessionStorage.getItem("hasSeenJudgesIntro");

      // Only show if not seen before (sessionStorage clears when tab closes)
      if (!hasSeenIntro) {
        // Small delay to let the page load visually first
        setTimeout(() => {
          setShowJudgesModal(true);
        }, 500);
      }
    }

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [location.pathname]); // Re-run logic when path changes

  const handleCloseJudgesModal = () => {
    setShowJudgesModal(false);
    sessionStorage.setItem("hasSeenJudgesIntro", "true"); // Mark as seen
  };

  return (
    <>
      {/* --- 1. MOBILE ONLY WARNING (Top Priority) --- */}
      {isLargeScreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="bg-[#1a0b2e] border border-purple-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center">
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
              or switch to your phone.
            </p>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-widest">
              Waiting for resize...
            </p>
          </div>
        </div>
      )}

      {/* --- 2. JUDGES WELCOME MODAL (Triggers on /app) --- */}
      {showJudgesModal && !isLargeScreen && (
        <div className="fixed inset-0 z-[9000] bg-[#0f0518]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-500">
          <div className="bg-gradient-to-b from-[#1a0b2e] to-[#0f0518] border border-white/10 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-purple-500/20 blur-[60px] pointer-events-none"></div>

            {/* Scrollable Content */}
            <div className="p-6 relative z-10 max-h-[85vh] overflow-y-auto no-scrollbar">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <h1 className="text-2xl font-black text-white leading-tight">
                  Welcome,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Judges!
                  </span>{" "}
                  🚀
                </h1>
                <p className="text-gray-400 text-xs mt-2 font-medium tracking-wide uppercase">
                  EchoVerse Prototype Showcase
                </p>
              </div>

              {/* Note 1: Architecture & Latency */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">
                      Architecture & Latency
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      We use{" "}
                      <span className="text-white">
                        Third-Party APIs (MiniMax)
                      </span>{" "}
                      for high-quality voice generation. Responses may take a
                      few seconds.
                    </p>
                    <div className="mt-2 text-[10px] text-blue-300/80 font-medium bg-blue-500/10 inline-block px-2 py-1 rounded">
                      ⚡ Roadmap: Custom GPU Servers for instant responses.
                    </div>
                  </div>
                </div>
              </div>

              {/* Note 2: Features */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MessageSquareHeart className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">
                      What to Experience
                    </h3>
                    <ul className="text-gray-400 text-xs space-y-1.5 list-disc pl-4 marker:text-pink-500">
                      <li>
                        Talk to{" "}
                        <span className="text-white">Real Personalities</span> &
                        Characters.
                      </li>
                      <li>
                        Switch between{" "}
                        <span className="text-white">Friend Mode</span> (Chat) &{" "}
                        <span className="text-white">Mimic Mode</span> (Repeat).
                      </li>
                      <li>Seamless Voice & Text Interaction.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Demo Video Link */}
              <div className="mb-6 text-center">
                <p className="text-gray-500 text-[10px] mb-2">
                  Network issues? Watch the live demo:
                </p>
                <a
                  href="YOUR_VIDEO_LINK_HERE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-800 transition-colors group"
                >
                  <PlayCircle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 text-sm font-medium">
                    Watch Working Demo
                  </span>
                </a>
              </div>

              {/* Start Button */}
              <button
                onClick={handleCloseJudgesModal}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" />
                Start Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ROUTES --- */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Avatars />} />
        <Route path="/app/:slug" element={<Charachter />} />
      </Routes>
    </>
  );
}
