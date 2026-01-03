import React, { useState, useRef, useEffect } from "react";
import ShinchanModel from "../components/ShinchanModel";
import {
  ChevronLeft,
  Menu,
  Music,
  Mic,
  MicOff,
  X,
  Play,
  Volume2,
  VolumeX,
  Globe,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// --- MOCK DATA FOR SONGS ---
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

// --- CONFIGURATION ---
const CHARACTER_CONFIG = {
  shinchan: {
    id: "shinchan",
    name: "Shinchan",
    voiceId: "male-qn-qingse",
    systemPrompt:
      "You are Shinchan. 5 years old. Funny, naughty. Reply in Hinglish. Catchphrases: 'Arre yaar', 'Balle Balle'.",
    image: "/images/shinchan.png",
    bg: "/images/sinchanbg.png",
  },
  gandhiji: {
    id: "gandhiji",
    name: "Mahatma Gandhi",
    voiceId: "male-qn-jingying",
    systemPrompt:
      "You are Mahatma Gandhi. Calm, wise, peaceful. Speak about Ahimsa and Truth. Reply in polite Hinglish or Hindi.",
    image: "/images/gandhi.png",
    bg: "/images/gandhibg.png",
  },
  honeysingh: {
    id: "honeysingh",
    name: "Honey Singh",
    voiceId: "male-qn-dangdai",
    systemPrompt:
      "You are Yo Yo Honey Singh. Rapper, swag, energetic. Use Punjabi slang and Hinglish. Say 'Yo Yo!' often.",
    image: "/images/honeysingh.png",
    bg: "/images/concertbg.png",
  },
  kalam: {
    id: "kalam",
    name: "Dr. Kalam",
    voiceId: "male-qn-shangwu",
    systemPrompt:
      "You are Dr. APJ Abdul Kalam. Inspirational, scientific, humble. Inspire the youth. Reply in Hinglish/English.",
    image: "/images/kalam.png",
    bg: "/images/spacebg.png",
  },
};

// --- API KEYS ---
const MINIMAX_API_KEY = "YOUR_MINIMAX_API_KEY";
const MINIMAX_GROUP_ID = "YOUR_MINIMAX_GROUP_ID";
const LLM_API_KEY = "YOUR_OPENAI_OR_GROQ_KEY";

const CharacterInteractionScreen = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const activeCharId = slug || "shinchan";
  const currentCharacter =
    CHARACTER_CONFIG[activeCharId] || CHARACTER_CONFIG["shinchan"];

  // Refs
  const audioRef = useRef(new Audio()); // For Voice (MiniMax)
  const bgAudioRef = useRef(new Audio("/audio/background_music.mp3")); // For BG Music
  const recognitionRef = useRef(null);

  // State
  const [animation, setAnimation] = useState("default");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("Mimic");
  const [isListening, setIsListening] = useState(false);
  const [showSongList, setShowSongList] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [isBgMusicOn, setIsBgMusicOn] = useState(true);

  // --- 0. THREAD MANAGEMENT ---
  useEffect(() => {
    stopListening();
    stopSong();
    setAnimation("default");
    setIsListening(false);
    setIsProcessing(false);
    console.log(`Switched to new thread for: ${currentCharacter.name}`);
  }, [activeCharId]);

  // --- AUTO-PLAY BACKGROUND MUSIC ---
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    bgAudio.loop = true;
    bgAudio.volume = 0.2;

    if (isBgMusicOn) {
      bgAudio.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    } else {
      bgAudio.pause();
    }

    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, [isBgMusicOn]);

  // --- 1. LLM LOGIC ---
  const fetchLLMResponse = async (userText) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LLM_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: currentCharacter.systemPrompt },
              { role: "user", content: userText },
            ],
          }),
        }
      );
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("LLM Error:", error);
      return "Network error! Try again.";
    }
  };

  // --- 2. TTS LOGIC (MiniMax) ---
  const speakWithMiniMax = async (text) => {
    try {
      if (bgAudioRef.current) bgAudioRef.current.volume = 0.1; // Lower BG music

      const response = await fetch(
        `https://api.minimax.chat/v1/t2a_v2?GroupId=${MINIMAX_GROUP_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MINIMAX_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "speech-01-turbo",
            text: text,
            voice_setting: {
              voice_id: currentCharacter.voiceId,
              speed: 1.1,
              vol: 1.0,
              pitch: 1,
            },
            audio_setting: { sample_rate: 32000, format: "mp3", channel: 1 },
          }),
        }
      );

      if (!response.ok) throw new Error("MiniMax API Failed");

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      audioRef.current.src = audioUrl;
      audioRef.current.onplay = () => setAnimation("talking");
      audioRef.current.onended = () => {
        setAnimation("default");
        if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
      };
      audioRef.current.play();
    } catch (error) {
      console.error("TTS Error:", error);
      setAnimation("default");
      if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
    }
  };

  // --- 3. SPEECH RECOGNITION ---
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Please use Google Chrome.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setAnimation("listen");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);

      if (activeMode === "Friend") {
        setIsProcessing(true);
        // setAnimation("thinking");
        const reply = await fetchLLMResponse(transcript);
        setIsProcessing(false);
        await speakWithMiniMax(reply);
      } else {
        setIsProcessing(false);
        await speakWithMiniMax(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setAnimation("default");
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  // --- HANDLERS ---
  const toggleLanguage = () =>
    setLanguage(language === "en-IN" ? "en-US" : "en-IN");

  const handleMicToggle = () => {
    if (currentSong) return;
    if (isListening) stopListening();
    else startListening();
  };

  const handleDanceClick = () => {
    if (animation === "dance") {
      setAnimation("default");
    } else {
      setAnimation("dance");
      setIsListening(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const selectSong = (song) => {
    setCurrentSong(song);
    setIsListening(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setShowSongList(false);
    if (animation !== "dance") setAnimation("default");
    if (bgAudioRef.current) bgAudioRef.current.pause(); // Stop BG music when song plays
  };

  const stopSong = () => {
    setCurrentSong(null);
    setAnimation("default");
    if (bgAudioRef.current && isBgMusicOn)
      bgAudioRef.current.play().catch((e) => console.log(e));
  };

  const handleModeSwitch = (mode) => {
    setActiveMode(mode);
    setIsListening(false);
    setAnimation("default");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleBack = () => navigate(-1);
  const handleMusicClick = () => setShowSongList(true);
  const toggleBgMusic = () => setIsBgMusicOn((prev) => !prev);

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-black">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('${currentCharacter.bg}')` }}
      />

      {/* Navigation */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 pt-12 z-20 pointer-events-none">
        <button
          onClick={handleBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={toggleLanguage}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
        >
          <Globe className="w-4 h-4 text-pink-300" />
          <span className="text-xs font-bold uppercase tracking-wide">
            {language === "en-IN" ? "Hinglish" : "English"}
          </span>
        </button>

        <button
          onClick={toggleMenu}
          className="pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Bg Music Toggle */}
      <button
        onClick={toggleBgMusic}
        className="absolute top-35 right-6 z-20 pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-purple-800 shadow-lg"
      >
        {isBgMusicOn ? (
          <Volume2 className="w-5 h-5 text-pink-300" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Side Menu */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-[#1a0b2e]/95 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
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
            <li>Profile</li>
            <li>Settings</li>
            <li>Logout</li>
          </ul>
        </div>
      </div>
      {isMenuOpen && (
        <div onClick={toggleMenu} className="fixed inset-0 bg-black/50 z-40" />
      )}

      {/* Character Model */}
      <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
        <div className="absolute bottom-0 w-full flex justify-center pointer-events-auto">
          <div className="w-[90vw] max-w-[420px] h-[520px] relative overflow-visible bg-transparent">
            <ShinchanModel
              animation={animation}
              image={currentCharacter.image}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-8 px-6 z-30">
        {/* Song Player Widget */}
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

        {/* Buttons */}
        <div className="flex justify-between items-center w-full mb-6 px-4">
          <button
            onClick={handleMusicClick}
            className="pointer-events-auto w-12 h-12 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white transition-transform active:scale-90 hover:bg-purple-800 shadow-lg"
          >
            <Music className="w-5 h-5" />
          </button>

          {/* Mic Button */}
          <div className="relative flex items-center justify-center pointer-events-auto">
            {isListening && !currentSong && (
              <>
                <div className="absolute inset-0 rounded-full bg-pink-500 opacity-20 animate-ping-slow"></div>
                <div className="absolute inset-0 rounded-full border border-pink-400 opacity-40 animate-ripple"></div>
              </>
            )}
            <button
              onClick={handleMicToggle}
              disabled={!!currentSong || isProcessing}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_5px_rgba(168,85,247,0.4)] transition-all duration-300 active:scale-95 
                ${
                  currentSong
                    ? "bg-gray-600 cursor-not-allowed opacity-80"
                    : isProcessing
                    ? "bg-yellow-600 animate-pulse"
                    : isListening
                    ? "bg-gradient-to-b from-pink-500 to-purple-600 scale-105 border-2 border-white/20"
                    : "bg-gradient-to-b from-purple-500 to-purple-800"
                }`}
            >
              {currentSong ? (
                <MicOff className="w-8 h-8 text-gray-400" />
              ) : isProcessing ? (
                <span className="text-xs font-bold animate-pulse">
                  THINKING
                </span>
              ) : (
                <Mic
                  className={`w-8 h-8 transition-transform ${
                    isListening ? "animate-pulse" : ""
                  }`}
                />
              )}
            </button>
          </div>

          <button
            onClick={handleDanceClick}
            className={`pointer-events-auto w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center text-white transition-transform active:scale-90 shadow-lg ${
              animation === "dance"
                ? "bg-pink-600 border-pink-400 scale-110 shadow-pink-500/50"
                : "bg-purple-900/60 border-purple-500/50 hover:bg-purple-800"
            }`}
          >
            <img src="/images/dance.png" width={30} alt="dance" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex w-full bg-purple-900/40 backdrop-blur-md rounded-full p-1 border border-white/10 relative pointer-events-auto">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300 shadow-lg ${
              activeMode === "Friend" ? "left-[calc(50%+2px)]" : "left-1"
            }`}
          ></div>
          <button
            onClick={() => handleModeSwitch("Mimic")}
            className={`flex-1 relative z-10 py-3 text-sm font-medium transition-colors duration-300 ${
              activeMode === "Mimic" ? "text-white" : "text-gray-300"
            }`}
          >
            Mimic Mode
          </button>
          <button
            onClick={() => handleModeSwitch("Friend")}
            className={`flex-1 relative z-10 py-3 text-sm font-medium transition-colors duration-300 ${
              activeMode === "Friend" ? "text-white" : "text-gray-300"
            }`}
          >
            Friend Mode
          </button>
        </div>
      </div>

      {/* --- RESTORED: SONG LIST POPUP --- */}
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

      {/* CSS Styles */}
      <style>{`
        @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes ping-slow { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-ripple { animation: ripple 2s linear infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CharacterInteractionScreen;
