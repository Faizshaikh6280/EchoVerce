import React, { useState } from "react"; // Removed useEffect
import ShinchanModel from "../components/ShinchanModel";

import {
  ChevronLeft,
  Menu,
  Music,
  Mic,
  MicOff,
  Sparkles,
  X,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Mock Data ---
const TRENDING_SONGS = [
  {
    id: 1,
    title: "Balle Balle",
    duration: "3:45",
    image: "https://picsum.photos/seed/dance1/100",
  },
  {
    id: 2,
    title: "Shinchan Theme",
    duration: "1:20",
    image: "https://picsum.photos/seed/anime/100",
  },
  {
    id: 3,
    title: "Party All Night",
    duration: "4:10",
    image: "https://picsum.photos/seed/party/100",
  },
  {
    id: 4,
    title: "Desi Beats",
    duration: "2:55",
    image: "https://picsum.photos/seed/beats/100",
  },
  {
    id: 5,
    title: "Lofi Vibes",
    duration: "2:15",
    image: "https://picsum.photos/seed/lofi/100",
  },
];

const CharacterInteractionScreen = () => {
  const navigate = useNavigate();

  // State

  const [animation, setAnimation] = useState("default");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("Mimic");
  const [isListening, setIsListening] = useState(false);
  const [showSongList, setShowSongList] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  // New State for Background Music
  const [isBgMusicOn, setIsBgMusicOn] = useState(true);

  // Assets
  const backgroundImage = "url('/images/sinchanbg.png')";
  const characterImage = "/images/shinchan.png";

  // --- Logic ---

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleBack = () => navigate(-1);

  const toggleBgMusic = () => {
    setIsBgMusicOn(!isBgMusicOn);
    console.log(`Background Music: ${!isBgMusicOn ? "ON" : "OFF"}`);
  };

  const handleMicToggle = () => {
    if (currentSong) return;

    const next = !isListening;
    setIsListening(next);

    if (next) {
      setAnimation("listen");     // mic ON
    } else {
      setAnimation("Talking");    // mic OFF
    }
  };


  const handleMusicClick = () => setShowSongList(true);

  const handleDanceClick = () => {
    setCurrentSong(null);
    setIsListening(false);
    setAnimation("dance");
  };

  const handleModeSwitch = (mode) => setActiveMode(mode);

  const selectSong = (song) => {
    setCurrentSong(song);
    setIsListening(false);
    setShowSongList(false);
    setAnimation("dance"); // 🎵 dance animation
  };


  const stopSong = () => {
    setCurrentSong(null);
    setAnimation("default"); // back to idle/wave
  };


  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-black">
      {/* 1. Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: backgroundImage }}
      />

      {/* 2. Top Navigation (Back & Menu) */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 pt-12 z-20 pointer-events-none">
        <button
          onClick={handleBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={toggleMenu}
          className="pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Background Music Toggle */}
      <button
        onClick={toggleBgMusic}
        // Fixed absolute position syntax (top-28 is roughly 7rem or 112px)
        className="absolute top-35 right-6 z-20 pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
      >
        {isBgMusicOn ? (
          <Volume2 className="w-5 h-5 text-pink-300" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* 4. Side Menu */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-[#1a0b2e]/95 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <ul className="space-y-4 text-gray-300">
            <li className="hover:text-pink-400 cursor-pointer">Profile</li>
            <li className="hover:text-pink-400 cursor-pointer">Settings</li>
            <li className="hover:text-pink-400 cursor-pointer">Logout</li>
          </ul>
        </div>
      </div>
      {isMenuOpen && (
        <div onClick={toggleMenu} className="fixed inset-0 bg-black/50 z-40" />
      )}

      {/* 5. Character Model */}
      {/* 5. Character Model */}
      <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
        <div className="absolute bottom-0 w-full flex justify-center pointer-events-auto">
          <div className="w-[90vw] max-w-[420px] h-[520px] relative overflow-visible bg-transparent">
            <ShinchanModel animation={animation} />
          </div>
        </div>
      </div>


      {/* 6. Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-8 px-6 z-30">
        {/* Playback Widget */}
        {currentSong && (
          <div className="mb-4 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-pink-500/30 flex items-center gap-3 animate-fade-in-up shadow-lg pointer-events-auto">
            <img
              src={currentSong.image}
              alt="art"
              className="w-6 h-6 rounded-full object-cover animate-[spin_4s_linear_infinite]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">
                {currentSong.title}
              </span>
              <span className="text-[10px] text-pink-300 leading-none mt-0.5">
                Mic Disabled
              </span>
            </div>
            <button
              onClick={stopSong}
              className="ml-2 hover:bg-white/10 rounded-full p-1"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}

        {/* Icons Row */}
        <div className="flex justify-between items-center w-full mb-6 px-4">
          {/* Music Button */}
          <button
            onClick={handleMusicClick}
            className="pointer-events-auto w-12 h-12 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white transition-transform active:scale-90 hover:bg-purple-800 shadow-lg"
          >
            <Music className="w-5 h-5" />
          </button>

          {/* Microphone Button */}
          <div className="relative flex items-center justify-center pointer-events-auto">
            {isListening && !currentSong && (
              <>
                <div className="absolute inset-0 rounded-full bg-pink-500 opacity-20 animate-ping-slow"></div>
                <div className="absolute inset-0 rounded-full border border-pink-400 opacity-40 animate-ripple"></div>
              </>
            )}

            <button
              onClick={handleMicToggle}
              disabled={!!currentSong}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_5px_rgba(168,85,247,0.4)] transition-all duration-300 active:scale-95 ${currentSong
                ? "bg-gray-600 cursor-not-allowed opacity-80"
                : isListening
                  ? "bg-gradient-to-b from-pink-500 to-purple-600 scale-105 border-2 border-white/20"
                  : "bg-gradient-to-b from-purple-500 to-purple-800"
                }`}
            >
              {currentSong ? (
                <MicOff className="w-8 h-8 text-gray-400" />
              ) : (
                <Mic
                  className={`w-8 h-8 transition-transform ${isListening ? "animate-pulse" : ""
                    }`}
                />
              )}
            </button>
          </div>

          {/* Dance Button */}
          <button
            onClick={handleDanceClick}
            className="pointer-events-auto w-12 h-12 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white transition-transform active:scale-90 hover:bg-purple-800 shadow-lg"
          >
            <Sparkles className="w-5 h-5 fill-current text-yellow-300" />
          </button>
        </div>

        {/* Toggle Mode Switcher */}
        <div className="flex w-full bg-purple-900/40 backdrop-blur-md rounded-full p-1 border border-white/10 relative pointer-events-auto">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300 shadow-lg ${activeMode === "Friend" ? "left-[calc(50%+2px)]" : "left-1"
              }`}
          ></div>
          <button
            onClick={() => handleModeSwitch("Mimic")}
            className={`flex-1 relative z-10 py-3 text-sm font-medium transition-colors duration-300 ${activeMode === "Mimic" ? "text-white" : "text-gray-300"
              }`}
          >
            Mimic Mode
          </button>
          <button
            onClick={() => handleModeSwitch("Friend")}
            className={`flex-1 relative z-10 py-3 text-sm font-medium transition-colors duration-300 ${activeMode === "Friend" ? "text-white" : "text-gray-300"
              }`}
          >
            Friend Mode
          </button>
        </div>
      </div>

      {/* 7. Song Selection Popup */}
      {showSongList && (
        <>
          <div
            onClick={() => setShowSongList(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed bottom-0 left-0 w-full bg-[#1e102f] rounded-t-[2rem] z-50 p-6 border-t border-white/10 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white font-bold text-xl">Select a Vibe</h3>
                <p className="text-gray-400 text-xs">
                  Pick a song for your partner
                </p>
              </div>
              <button
                onClick={() => setShowSongList(false)}
                className="bg-white/10 p-2 rounded-full hover:bg-white/20"
              >
                <X className="text-white w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-8">
              {TRENDING_SONGS.map((song) => (
                <div
                  key={song.id}
                  onClick={() => selectSong(song)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#2a1b3d] border border-white/5 active:bg-[#3d2757] transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm"
                    />
                    <div>
                      <p className="text-white text-sm font-bold tracking-wide">
                        {song.title}
                      </p>
                      <p className="text-pink-400/80 text-xs font-medium">
                        {song.duration}
                      </p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Styles */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-ripple { animation: ripple 2s linear infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CharacterInteractionScreen;      