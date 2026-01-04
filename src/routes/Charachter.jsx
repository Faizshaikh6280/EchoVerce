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
import { CHARACTER_CONFIG, TRENDING_SONGS } from "../config";

const CharacterInteractionScreen = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const activeCharId = slug || "shinchan";
  const currentCharacter =
    CHARACTER_CONFIG[activeCharId] || CHARACTER_CONFIG["shinchan"];

  const audioRef = useRef(new Audio());
  const bgAudioRef = useRef(new Audio("/audio/background_music.mp3"));
  const recognitionRef = useRef(null);
  // Refs for logic
  const silenceTimer = useRef(null); // Tracks the 5s countdown
  const transcriptAccumulator = useRef(""); // Stores the full text as you speak

  const [animation, setAnimation] = useState("default");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("Mimic");
  const [isListening, setIsListening] = useState(false);
  const [showSongList, setShowSongList] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBgMusicOn, setIsBgMusicOn] = useState(true);
  // Stores the last few messages for context
  const [chatHistory, setChatHistory] = useState([]);

  // --- 0. THREAD MANAGEMENT ---
  useEffect(() => {
    stopListening();
    stopSong();
    setAnimation("default");
    setIsListening(false);
    setIsProcessing(false);
    console.log(`Switched to new thread for: ${currentCharacter.name}`);
  }, [activeCharId, currentCharacter.name]);

  // --- AUTO-PLAY BACKGROUND MUSIC ---
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    bgAudio.loop = true;
    bgAudio.volume = 0.2;

    if (isBgMusicOn) {
      bgAudio.play().catch((error) => {
        console.warn("Autoplay prevented (Interact with page first):", error);
      });
    } else {
      bgAudio.pause();
    }

    return () => {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    };
  }, [isBgMusicOn]);

  // --- 1. INTELLIGENCE (Groq LLM) ---
  const fetchLLMResponse = async (userText) => {
    console.log("hello");

    try {
      // A. Dynamic Language Rule

      // B. Construct Messages
      const systemMessage = {
        role: "system",
        content: `${currentCharacter.systemPrompt} Keep response under 2 sentences.`,
      };

      // OPTIMIZATION: Combine System + History + User
      // Using chatHistory directly is fine for turn-based voice chats.
      const payloadMessages = [
        systemMessage,
        ...chatHistory.slice(-6), // Keep context light
        { role: "user", content: userText },
      ];

      console.log("📤 Sending to Groq:", payloadMessages);

      // C. Call Groq API
      const response = await fetch(import.meta.env.VITE_GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          // USE THIS MODEL for better Hinglish & speed
          model: "llama-3.1-8b-instant",
          messages: payloadMessages,
          // 0.6 - 0.7 is the sweet spot for characters (creative but not crazy)
          temperature: 0.7,
          // Strict limit to keep TTS fast (approx 2-3 sentences)
          max_tokens: 80,
        }),
      });

      if (!response.ok) throw new Error(`Groq Error: ${response.status}`);

      const data = await response.json();
      const botReply = data.choices[0].message.content || "Empty response";

      console.log("📥 Groq Reply:", botReply);

      // D. Update Memory (With Safety Cap)
      setChatHistory((prev) => {
        // OPTIMIZATION: Don't let the array grow forever. Keep only last 20 items in memory.
        const newHistory = [
          ...prev,
          { role: "user", content: userText },
          { role: "assistant", content: botReply },
        ];
        return newHistory.slice(-20);
      });

      return botReply;
    } catch (error) {
      console.error("LLM Error:", error);
      // Return language-specific fallback

      return "Oh no! My connection is bad.";
    }
  };

  // --- 2. VOICE OUTPUT (Localhost Version) ---
  const speakWithMiniMax = async (text) => {
    if (!text) return;
    console.log("🔊 Generating Audio for:", text);

    try {
      // 1. Lower background music volume
      if (bgAudioRef.current) bgAudioRef.current.volume = 0.1;

      // --- CHANGE IS HERE ---
      // Use localhost for testing. Uncomment the Render URL when you deploy later.
      const API_URL = "http://localhost:3000/api/speak";
      // const API_URL = "https://echoverceserver.onrender.com/api/speak";

      console.log("📡 Sending request to:", API_URL);

      // 2. Fetch from your LOCAL Server
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceId: currentCharacter.voiceId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // This will now show the exact error from your local server console!
        throw new Error(`Server Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // Check for internal MiniMax errors
      if (data.base_resp && data.base_resp.status_code !== 0) {
        throw new Error(data.base_resp.status_msg);
      }

      // 3. Decode Hex Audio
      const audioHex = data.data.audio;
      const audioBytes = new Uint8Array(
        audioHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );
      const audioBlob = new Blob([audioBytes], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);

      // 4. Play Audio & Sync Animation
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioUrl;

      audio.onplay = () => {
        console.log("▶️ Audio Playing -> Animation: talking");
        setAnimation("Talking");
      };

      audio.onended = () => {
        console.log("⏹️ Audio Ended -> Animation: default");
        setAnimation("default");
        if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
      };

      audio.onerror = (e) => {
        console.error("Audio Playback Failed", e);
        setAnimation("default");
        if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
      };

      await audio.play();
    } catch (error) {
      console.error("❌ TTS Error:", error);
      setAnimation("default");
      if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;

      // Alert the user so you see the error clearly on screen
      alert(`TTS Failed: ${error.message}`);
    }
  };

  // // --- 2. VOICE OUTPUT (Fixed: Now uses your Render Proxy) ---
  // const speakWithMiniMax = async (text) => {
  //   if (!text) return;
  //   console.log("🔊 Generating Audio for:", text);

  //   try {
  //     // 1. Lower background music volume
  //     if (bgAudioRef.current) bgAudioRef.current.volume = 0.1;

  //     // 2. Fetch from YOUR Render Server (The Middleman)
  //     // We no longer send the API Key here. We only send what the server needs: text & voiceId.
  //     const response = await fetch(
  //       "https://echoverceserver.onrender.com/api/speak",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           text: text,
  //           voiceId: currentCharacter.voiceId, // Send only the ID, the server handles the rest
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       // Try to get the error message from the server, or default to status text
  //       const errorText = await response.text();
  //       throw new Error(`Server Error (${response.status}): ${errorText}`);
  //     }

  //     const data = await response.json();

  //     // Check for internal MiniMax errors passed through your proxy
  //     if (data.base_resp && data.base_resp.status_code !== 0) {
  //       throw new Error(data.base_resp.status_msg);
  //     }

  //     // 3. Decode Hex Audio (Same as before)
  //     const audioHex = data.data.audio;
  //     const audioBytes = new Uint8Array(
  //       audioHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  //     );
  //     const audioBlob = new Blob([audioBytes], { type: "audio/mp3" });
  //     const audioUrl = URL.createObjectURL(audioBlob);

  //     // 4. Play Audio & Sync Animation (Same as before)
  //     const audio = audioRef.current;

  //     audio.pause();
  //     audio.currentTime = 0;
  //     audio.src = audioUrl;

  //     // --- ANIMATION EVENTS ---

  //     audio.onplay = () => {
  //       console.log("▶️ Audio Playing -> Animation: talking");
  //       setAnimation("Talking");
  //     };

  //     audio.onended = () => {
  //       console.log("⏹️ Audio Ended -> Animation: default");
  //       setAnimation("default");
  //       if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
  //     };

  //     audio.onerror = (e) => {
  //       console.error("Audio Playback Failed", e);
  //       setAnimation("default");
  //       if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
  //     };

  //     await audio.play();
  //   } catch (error) {
  //     console.error("❌ TTS Error:", error);
  //     setAnimation("default");
  //     // Restore BG Music on error
  //     if (bgAudioRef.current && isBgMusicOn) bgAudioRef.current.volume = 0.2;
  //   }
  // };

  // --- 3. SPEECH RECOGNITION (Multi-Sentence + Auto-Stop) ---
  const startListening = () => {
    // 1. Browser Support Check
    if (!("webkitSpeechRecognition" in window)) {
      alert("Please use Google Chrome.");
      return;
    }

    // 2. Cleanup previous instances
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (silenceTimer.current) clearTimeout(silenceTimer.current);

    // 3. Reset Transcript
    transcriptAccumulator.current = "";

    // 4. Configure Recognition
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true; // Allow multiple sentences
    recognition.interimResults = true; // Get results while speaking (to reset timer)
    recognition.lang = "en-IN"; // Use Indian English for better Hinglish support
    // --- HELPER: RESET SILENCE TIMER ---
    const resetSilenceTimer = () => {
      // Clear existing timer
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      // Set new 2-second timer
      silenceTimer.current = setTimeout(() => {
        console.log("🛑 Silence detected (2s). Stopping mic automatically...");
        recognition.stop();
      }, 3000); // 2000ms = 2 seconds
    };

    // --- EVENT HANDLERS ---

    recognition.onstart = () => {
      console.log("🎤 Mic ON. Speak multiple sentences...");
      setIsListening(true);
      setAnimation("listen");
      resetSilenceTimer(); // Start the first countdown
    };

    recognition.onresult = (event) => {
      resetSilenceTimer(); // User spoke! Reset the 5s kill-switch

      // Iterate through results to handle final vs interim text
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // If this sentence is finished, add it to our accumulator
          const sentence = event.results[i][0].transcript;
          transcriptAccumulator.current += sentence + " ";
          console.log("📝 Sentence captured:", sentence);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ Mic Error:", event.error);

      // Ignore 'no-speech' if we already have some text recorded
      if (event.error === "no-speech") {
        if (transcriptAccumulator.current.trim().length > 0) {
          // We have text, so this just means the user stopped talking.
          // Treat it as a normal stop.
          recognition.stop();
          return;
        }
      }

      // Real error handling
      setIsListening(false);
      setAnimation("default");
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };

    recognition.onend = async () => {
      console.log("🛑 Mic OFF. Processing final result...");
      setIsListening(false);
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      // Get the final full text
      const finalFullText = transcriptAccumulator.current.trim();
      console.log("✅ FULL TRANSCRIPT:", finalFullText);

      // Only proceed if we actually caught some words
      if (finalFullText.length > 0) {
        if (activeMode === "Friend") {
          setIsProcessing(true);
          // setAnimation("thinking");
          const reply = await fetchLLMResponse(finalFullText);
          console.log(reply);
          setIsProcessing(false);
          await speakWithMiniMax(reply);
        } else {
          // Mimic Mode
          setIsProcessing(false);
          await speakWithMiniMax(finalFullText);
        }
      } else {
        // No text captured
        setAnimation("default");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Triggers onend automatically
    }
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }
  };

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
    if (bgAudioRef.current) bgAudioRef.current.pause();
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
