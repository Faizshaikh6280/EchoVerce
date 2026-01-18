import React, { useState, useRef, useEffect } from "react";
import ShinchanModel from "../components/ShinchanModel";
import { Toaster } from "react-hot-toast";
import { showErrorToast } from "../utils/toast";

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
  Pause,
  Loader2,
  MessageCircle,
  Send,
  User,
  Move,
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
  const songAudioRef = useRef(new Audio());

  const bgAudioRef = useRef(
    new Audio(currentCharacter.music || "/audio/background_music.mp3")
  );

  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const transcriptAccumulator = useRef("");
  const chatInputRef = useRef(null);

  const [animation, setAnimation] = useState("default");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("Mimic");
  const [isListening, setIsListening] = useState(false);
  const [showSongList, setShowSongList] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBgMusicOn, setIsBgMusicOn] = useState(true);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Chat mode states
  const [isChatMode, setIsChatMode] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatBubbles, setChatBubbles] = useState([]);

  // --- DRAGGABLE AVATAR STATE ---
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // --- 0. THREAD & MUSIC MANAGEMENT ---
  useEffect(() => {
    stopListening();
    stopSong();
    setAnimation("default");
    setIsListening(false);
    setIsProcessing(false);
    console.log(`Switched to new thread for: ${currentCharacter.name}`);

    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.src =
        currentCharacter.music || "/audio/background_music.mp3";
      bgAudioRef.current.volume = 0.2;
      bgAudioRef.current.loop = true;

      if (isBgMusicOn) {
        bgAudioRef.current.play().catch((error) => {
          console.warn("Autoplay prevented on switch:", error);
        });
      }
    }
  }, [activeCharId, currentCharacter.name, currentCharacter.music]);

  // --- AUTO POSITION SHIFT ON CHAT MODE ---
  useEffect(() => {
    if (isChatMode) {
      // Shift right when chat opens to make space for bubbles
      setAvatarPosition((prev) => ({ ...prev, x: 120 }));
    } else {
      // Center when chat closes
      setAvatarPosition((prev) => ({ ...prev, x: 0 }));
    }
  }, [isChatMode]);

  // --- AUTO-PLAY BACKGROUND MUSIC ---
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    bgAudio.loop = true;

    if (isBgMusicOn) {
      bgAudio.volume = 0.2;
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

  // --- DRAG HANDLERS ---
  const handleDragStart = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return;
    setIsDragging(true);
    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    dragStartPos.current = {
      x: clientX - avatarPosition.x,
      y: clientY - avatarPosition.y,
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    setAvatarPosition({
      x: clientX - dragStartPos.current.x,
      y: clientY - dragStartPos.current.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging]);

  // --- 1. INTELLIGENCE (Gemini LLM) ---
  const fetchLLMResponse = async (userText, isVoiceMode = true) => {
    try {
      console.log(`📤 Sending to Gemini (${currentCharacter.name}):`, userText);

      let modeSpecificPrompt = currentCharacter.systemPrompt;

      if (isVoiceMode) {
        modeSpecificPrompt += `\n\nSTRICT LANGUAGE RULES (VOICE MODE):
        1. You must ALWAYS reply in pure HINDI language (Devanagari script).
        2. NEVER use English characters.
        3. Use only Hindi script: हिंदी में जवाब दें।`;
      } else {
        modeSpecificPrompt += `\n\nSTRICT LANGUAGE RULES (CHAT MODE):
        1. You must reply in HINGLISH (Hindi words written in English).
        2. Mix Hindi and English naturally.
        3. Keep it casual, fun and conversational.
        4. DO NOT use Devanagari script here. Use English alphabet only.
        5. Use relevant emojis based on conversation.
        `;
      }

      const response = await fetch("http://localhost:3000/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName: currentCharacter.name,
          systemPrompt: modeSpecificPrompt,
          history: chatHistory,
          userText: userText,
        }),
      });

      if (!response.ok)
        throw new Error(`Backend LLM Error: ${response.status}`);

      const data = await response.json();
      const botReply = data.reply || "Empty response";

      console.log("📥 Gemini Reply:", botReply);

      setChatHistory((prev) => {
        const newHistory = [
          ...prev,
          { role: "user", content: userText },
          { role: "assistant", content: botReply },
        ];
        return newHistory.slice(-20);
      });

      return botReply;
    } catch (error) {
      console.error("❌ Gemini API Error:", error);
      showErrorToast("Oops! Brain connection lost. Try again?");
      return isChatMode
        ? "Sorry yaar, network issue!"
        : "अरे! लगता है मेरा दिमाग थोड़ा घूम गया है। फिर से बोलना?";
    }
  };

  // --- 2. VOICE OUTPUT (Voice Mode Only) ---
  const speakWithMiniMax = async (text) => {
    if (!text) return;

    const audio = audioRef.current;
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (animation !== "dance") setAnimation("default");

    console.log("🔊 Requesting Audio for:", text);

    try {
      const response = await fetch("http://localhost:3000/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, voiceId: currentCharacter.voiceId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server connection failed");
      }

      const data = await response.json();
      const audioHex = data.data.audio;
      if (!audioHex) throw new Error("No audio data received");

      const audioBytes = new Uint8Array(
        audioHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );
      const audioBlob = new Blob([audioBytes], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);

      audio.src = audioUrl;

      audio.onplay = () => {
        if (animation !== "dance") setAnimation("Talking");
        if (bgAudioRef.current && isBgMusicOn && !currentSong)
          bgAudioRef.current.volume = 0.05;
      };

      audio.onended = () => {
        if (animation !== "dance") setAnimation("default");
        if (bgAudioRef.current && isBgMusicOn && !currentSong)
          bgAudioRef.current.volume = 0.2;
      };

      audio.onerror = (e) => {
        console.error("Audio Playback Error", e);
        if (animation !== "dance") setAnimation("default");
        if (bgAudioRef.current && isBgMusicOn && !currentSong)
          bgAudioRef.current.volume = 0.2;
      };

      await audio.play();
    } catch (error) {
      console.error("❌ TTS Failed:", error.message);
      if (animation !== "dance") setAnimation("default");
      if (bgAudioRef.current && isBgMusicOn && !currentSong)
        bgAudioRef.current.volume = 0.2;
    }
  };

  // --- 3. SPEECH RECOGNITION ---
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      showErrorToast("Please use Google Chrome for voice recognition.");
      return;
    }

    if (recognitionRef.current) recognitionRef.current.abort();
    if (silenceTimer.current) clearTimeout(silenceTimer.current);

    transcriptAccumulator.current = "";
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "hi-IN";

    const resetSilenceTimer = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        console.log("🛑 Silence detected (3s). Stopping mic...");
        recognition.stop();
      }, 3000);
    };

    recognition.onstart = () => {
      setIsListening(true);
      if (animation !== "dance") setAnimation("listen");
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      resetSilenceTimer();
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcriptAccumulator.current += event.results[i][0].transcript + " ";
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        if (transcriptAccumulator.current.trim().length > 0) {
          recognition.stop();
          return;
        }
      }
      setIsListening(false);
      if (animation !== "dance") setAnimation("default");
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      const finalFullText = transcriptAccumulator.current.trim();

      if (finalFullText.length > 0) {
        if (activeMode === "Friend") {
          setIsProcessing(true);
          const reply = await fetchLLMResponse(finalFullText, true);
          setIsProcessing(false);
          await speakWithMiniMax(reply);
        } else {
          setIsProcessing(false);
          await speakWithMiniMax(finalFullText);
        }
      } else {
        if (animation !== "dance") setAnimation("default");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // --- CHAT MODE FUNCTIONS ---
  const handleChatClick = () => {
    const newChatMode = !isChatMode;
    setIsChatMode(newChatMode);
    setShowChatInput(newChatMode);

    if (newChatMode) {
      setActiveMode("Friend");
      if (isListening) stopListening();
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    const userBubbleId = Date.now();

    // 1. Show User Bubble
    setChatBubbles((prev) => [
      ...prev,
      { id: userBubbleId, type: "user", text: userMessage },
    ]);

    setChatMessage("");
    setIsProcessing(true);

    // 2. Fetch Response
    const reply = await fetchLLMResponse(userMessage, false);
    setIsProcessing(false);

    // 3. Remove User Bubble, Show Bot Bubble (Wait a tiny bit for transition)
    setChatBubbles((prev) => prev.filter((b) => b.id !== userBubbleId));

    const botBubbleId = Date.now() + 1;
    setChatBubbles((prev) => [
      ...prev,
      { id: botBubbleId, type: "bot", text: reply },
    ]);

    // 4. Fade out bot bubble after 8 seconds
    setTimeout(() => {
      setChatBubbles((prev) => prev.filter((b) => b.id !== botBubbleId));
    }, 20000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- DANCE & MUSIC ---
  const handleDanceClick = () => setShowSongList(true);

  const selectSong = (song) => {
    setCurrentSong(song);
    setIsListening(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setShowSongList(false);
    if (bgAudioRef.current) bgAudioRef.current.pause();

    setAnimation("dance");
    const songAudio = songAudioRef.current;
    if (!songAudio.paused) {
      songAudio.pause();
      songAudio.currentTime = 0;
    }
    if (!song.url) return;

    songAudio.src = song.url;
    songAudio.onplay = () => {
      setIsSongPlaying(true);
      setAnimation("dance");
    };
    songAudio.onpause = () => {
      setIsSongPlaying(false);
      setAnimation("default");
    };
    songAudio.onended = () => {
      setIsSongPlaying(false);
      stopSong();
    };
    songAudio.play().catch((e) => console.error(e));
  };

  const stopSong = () => {
    const songAudio = songAudioRef.current;
    songAudio.pause();
    songAudio.currentTime = 0;
    setCurrentSong(null);
    setIsSongPlaying(false);
    setAnimation("default");
    if (bgAudioRef.current && isBgMusicOn) {
      bgAudioRef.current.volume = 0.2;
      bgAudioRef.current.play().catch((e) => console.log(e));
    }
  };

  const toggleSongPlayback = () => {
    const songAudio = songAudioRef.current;
    if (songAudio.paused) songAudio.play();
    else songAudio.pause();
  };

  const handleModeSwitch = (mode) => {
    setActiveMode(mode);
    setIsListening(false);
    if (animation !== "dance") setAnimation("default");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleBack = () => navigate(-1);
  const toggleBgMusic = () => setIsBgMusicOn((prev) => !prev);

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-black">
      <Toaster />

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('${currentCharacter.bg}')` }}
      />

      {/* Navigation */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 pt-12 z-20 pointer-events-none">
        <button
          onClick={handleBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={toggleMenu}
          className="pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT BUBBLES CONTAINER */}
      <div className="absolute inset-0 z-25 pointer-events-none overflow-hidden">
        {chatBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute w-full ${
              bubble.type === "user"
                ? "left-0 animate-user-float-slow"
                : "right-[80px] animate-bot-pop-right" // BOT POP FROM RIGHT
            }`}
            style={{
              top: bubble.type === "user" ? "50%" : "20%", // Bot appears around chest height
              display: "flex",
              justifyContent:
                bubble.type === "user" ? "flex-start" : "flex-end", // Alignment
              paddingRight: bubble.type === "bot" ? "20px" : "0",
            }}
          >
            {bubble.type === "user" ? (
              /* --- USER BUBBLE (Left Side) --- */
              <div className="flex items-center gap-2 pl-6">
                {/* Dummy User Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white/50 shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-lg max-w-[220px]">
                  <p className="text-purple-900 font-bold text-sm leading-snug">
                    {bubble.text}
                  </p>
                </div>
              </div>
            ) : (
              /* --- BOT BUBBLE (Right Side) --- */
              <div className="flex flex-row-reverse items-start gap-2 pr-6">
                {/* Character Avatar */}
                <img
                  src={currentCharacter.face}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-xl object-cover bg-white"
                />
                {/* Bubble */}
                <div className="bg-yellow-400 text-black rounded-2xl rounded-tr-none px-4 py-3 shadow-lg max-w-[240px]">
                  <p className="font-bold text-[12px] leading-snug">
                    {bubble.text}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Song Player Widget */}
      {currentSong && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-pink-500/30 flex items-center gap-2 shadow-lg">
            <img
              src={currentSong.image}
              alt="art"
              className={`w-7 h-7 rounded-full object-cover ${
                isSongPlaying ? "animate-[spin_4s_linear_infinite]" : ""
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white max-w-[100px] truncate">
                {currentSong.title}
              </span>
            </div>
            <button
              onClick={toggleSongPlayback}
              className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center"
            >
              {isSongPlaying ? (
                <Pause className="w-3 h-3 text-white" />
              ) : (
                <Play className="w-3 h-3 text-white" />
              )}
            </button>
            <button
              onClick={stopSong}
              className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Bg Music Toggle */}
      <button
        onClick={toggleBgMusic}
        className="absolute top-35 right-6 z-20 pointer-events-auto w-10 h-10 rounded-full bg-purple-900/60 backdrop-blur-md border border-purple-500/50 flex items-center justify-center text-white shadow-lg"
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

      {/* Character Model (Draggable) */}
      <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
        <div
          className="absolute bottom-0 w-full flex justify-center pointer-events-auto transition-transform duration-500 ease-in-out"
          style={{
            transform: `translate(${avatarPosition.x}px, ${avatarPosition.y}px)`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-[90vw] max-w-[420px] h-[520px] relative overflow-visible bg-transparent">
            <div className="absolute top-0 right-0 bg-white/20 p-1 rounded-full text-white/50 hover:text-white hover:bg-white/40 transition-colors">
              <Move className="w-4 h-4" />
            </div>
            <ShinchanModel
              animation={animation}
              image={currentCharacter.image}
            />
          </div>
        </div>
      </div>

      {/* Controls - FIXED TO BOTTOM */}
      <div className="fixed bottom-0 left-0 w-full z-30 flex flex-col items-center">
        {/* Chat Input */}
        {showChatInput && isChatMode && (
          <div className="w-full bg-[#1a0b2e] border-t border-purple-500/30 p-3 pointer-events-auto pb-6">
            <div className="flex items-center gap-2">
              {/* DANCE ICON IN CHAT MODE */}
              <button
                onClick={handleDanceClick}
                className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-500/50 flex items-center justify-center hover:bg-purple-800 shadow-lg"
              >
                <img src="/images/dance.png" width={20} alt="dance" />
              </button>

              <input
                ref={chatInputRef}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-[#2a1b3d] border border-purple-500/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isProcessing}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <button
              onClick={handleChatClick}
              className="absolute -top-10 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 pointer-events-auto hover:bg-red-500/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Standard Buttons */}
        {!showChatInput && (
          <div className="w-full pb-8 px-6">
            <div className="flex justify-between items-center w-full mb-6 px-4">
              <button
                onClick={handleDanceClick}
                className="pointer-events-auto w-12 h-12 rounded-full backdrop-blur-md border border-purple-500/50 bg-purple-900/60 flex items-center justify-center hover:bg-purple-800 shadow-lg"
              >
                <img src="/images/dance.png" width={30} alt="dance" />
              </button>

              <div className="relative flex items-center justify-center pointer-events-auto">
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-pink-500 opacity-20 animate-ping-slow"></div>
                    <div className="absolute inset-0 rounded-full border border-pink-400 opacity-40 animate-ripple"></div>
                  </>
                )}
                <button
                  onClick={handleMicToggle}
                  disabled={isProcessing}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_5px_rgba(168,85,247,0.4)] transition-all duration-300 active:scale-95 ${
                    isProcessing
                      ? "bg-purple-600/80"
                      : isListening
                      ? "bg-gradient-to-b from-pink-500 to-purple-600 scale-105 border-2 border-white/20"
                      : "bg-gradient-to-b from-purple-500 to-purple-800"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Mic
                      className={`w-8 h-8 ${
                        isListening ? "animate-pulse" : ""
                      }`}
                    />
                  )}
                </button>
              </div>

              <button
                onClick={handleChatClick}
                className="pointer-events-auto w-12 h-12 rounded-full backdrop-blur-md border border-purple-500/50 bg-purple-900/60 flex items-center justify-center hover:bg-purple-800 shadow-lg"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
            </div>

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
        )}
      </div>

      {/* Song List Popup */}
      {showSongList && (
        <>
          <div
            onClick={() => setShowSongList(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed bottom-0 left-0 w-full bg-[#1e102f] rounded-t-[2rem] z-50 p-6 border-t border-white/10 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white font-bold text-xl">
                  Select Dance Music
                </h3>
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
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#2a1b3d] border border-white/5 active:bg-[#3d2757] cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm"
                    />
                    <div>
                      <p className="text-white text-sm font-bold">
                        {song.title}
                      </p>
                      <p className="text-pink-400/80 text-xs">
                        {song.duration}
                      </p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white ml-0.5" />
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
        
        @keyframes user-float-slow {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            10% { transform: translateY(0) scale(1); opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(-300px) scale(1); opacity: 0; }
        }

        /* Bot Pop Right: Pops out from Avatar (Right Side) */
        @keyframes bot-pop-right {
            0% { transform: translateX(50px) scale(0.5); opacity: 0; }
            20% { transform: translateX(0) scale(1); opacity: 1; }
            80% { transform: translateX(0) scale(1); opacity: 1; }
            100% { transform: translateX(-10px) translateY(-20px) scale(0.9); opacity: 0; }
        }

        .animate-user-float-slow { animation: user-float-slow 4s ease-out forwards; }
        .animate-bot-pop-right { animation: bot-pop-right 6s ease-in-out forwards; }
        .animate-ripple { animation: ripple 2s linear infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CharacterInteractionScreen;
