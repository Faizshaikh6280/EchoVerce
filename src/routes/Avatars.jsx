import React, { useState, useMemo } from "react";
import { Search, Heart, Home, ArrowRight, Ghost } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- MOCK DATA ---
const INITIAL_DATA = [
  {
    id: 1,
    name: "SHINCHAN",
    category: "Funny",
    isPaid: false,
    image: "/images/Shinchan.png",
    slug: "shinchan",
  },
  {
    id: 2,
    name: "MOTU",
    category: "Funny",
    isPaid: true,
    image: "/images/moto.png",
    slug: "motu",
  },
  {
    id: 3,
    name: "APJ ABDUL KALAM JI",
    category: "Calm",
    isPaid: false,
    image: "/images/apjabdulkalam.png",
    slug: "apj-abdul-kalam",
  },
  {
    id: 4,
    name: "BUDDHA JI",
    category: "Calm",
    isPaid: true,
    image: "/images/buddhaji.png",
    slug: "buddhaji",
  },
  {
    id: 5,
    name: "ED SHEERAN",
    category: "Energetic",
    isPaid: false,
    image: "/images/ed.png",
    slug: "ed-sheeran",
  },
  {
    id: 6,
    name: "DORAEMON",
    category: "Energetic",
    isPaid: true,
    image: "/images/doremon.png",
    slug: "doraemon",
  },
  {
    id: 7,
    name: "OGGY",
    category: "Emotional",
    isPaid: false,
    image: "/images/oggy.png",
    slug: "oggy",
  },
  {
    id: 8,
    name: "ARIJIT SINGH",
    category: "Emotional",
    isPaid: true,
    image: "/images/arijitsingh.png",
    slug: "arijitsingh",
  },
];

const FILTERS = ["All", "Funny", "Calm", "Emotional", "Energetic", "Angry"];

const Avatars = () => {
  const [activeTab, setActiveTab] = useState("home"); // 'home' or 'wishlist'
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);

  // --- LOGIC ---

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 1. Filter Logic for HOME TAB
  const homeData = useMemo(() => {
    return INITIAL_DATA.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || item.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  // 2. Filter Logic for WISHLIST TAB
  const wishlistData = useMemo(() => {
    return INITIAL_DATA.filter((item) => {
      // Only show items that are in the wishlist array
      const isInWishlist = wishlist.includes(item.id);
      // Optional: Allow searching within wishlist too
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return isInWishlist && matchesSearch;
    });
  }, [searchQuery, wishlist]);

  // 3. Grouping Logic (Only needed for Home Tab)
  const groupedHomeData = useMemo(() => {
    if (activeFilter !== "All") return { [activeFilter]: homeData };

    return homeData.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [homeData, activeFilter]);

  return (
    <div className="min-h-screen bg-[#1a0b2e] text-white font-sans pb-24 overflow-x-hidden relative">
      {/* --- HEADER WRAPPER FOR DESKTOP CENTERING --- */}
      <div className="sticky top-0 z-20 bg-[#1a0b2e]">
        <div className="pt-6 px-4 pb-2 max-w-7xl mx-auto w-full">
          <div className="relative mb-6 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={
                activeTab === "home"
                  ? "Search Your Partner"
                  : "Search in Wishlist"
              }
              className="w-full bg-[#2a1b3d] border border-gray-600 rounded-full py-3 pl-5 pr-12 text-gray-300 focus:outline-none focus:border-purple-400 placeholder-gray-400 transition-all hover:border-purple-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Show Filters only on Home Tab */}
          {activeTab === "home" ? (
            <>
              <h1 className="text-xl md:text-3xl text-center font-black mb-6 tracking-wide font-light text-accent uppercase font-primary">
                Pick one that matches your mood!
              </h1>
              {/* Filter Pills Container - Optimized for Desktop */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 touch-pan-x md:justify-center md:flex-wrap">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-1.5 rounded-full text-sm md:text-base md:px-6 md:py-2 whitespace-nowrap transition-all flex-shrink-0 duration-300 ${
                      activeFilter === filter
                        ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold shadow-lg shadow-purple-500/30 scale-105"
                        : "bg-[#2a1b3d] text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <h1 className="text-xl md:text-3xl font-black mb-4 tracking-wide text-pink-200 uppercase text-center">
              Your Wishlist
            </h1>
          )}
        </div>
      </div>

      {/* --- CONTENT AREA WRAPPER --- */}
      <div className="px-4 space-y-8 mt-4 max-w-7xl mx-auto w-full">
        {/* VIEW: HOME TAB */}
        {activeTab === "home" &&
          (Object.keys(groupedHomeData).length === 0 ? (
            <div className="text-center text-gray-500 mt-20 text-lg">
              No partners found matching your search.
            </div>
          ) : (
            Object.entries(groupedHomeData).map(([category, items]) => (
              <div key={category} className="animate-fade-in">
                <div className="flex justify-between items-end mb-4 border-b-2 border-purple-900/50 pb-2">
                  <h2 className="text-lg md:text-2xl font-bold text-pink-200 capitalize">
                    {category} Partners
                  </h2>
                </div>

                {/* RESPONSIVE GRID LAYOUT  */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {items.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      isWishlisted={wishlist.includes(character.id)}
                      onToggleWishlist={() => toggleWishlist(character.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          ))}

        {/* VIEW: WISHLIST TAB */}
        {activeTab === "wishlist" &&
          (wishlistData.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 opacity-50 min-h-[40vh]">
              <Ghost className="w-16 h-16 md:w-24 md:h-24 text-purple-400 mb-4" />
              <p className="text-gray-400 text-lg md:text-xl">
                Your wishlist is empty.
              </p>
              <button
                onClick={() => setActiveTab("home")}
                className="mt-6 text-pink-400 underline text-sm md:text-base hover:text-pink-300 transition-colors"
              >
                Go explore partners
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
              {wishlistData.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isWishlisted={true} // Always true in wishlist view
                  onToggleWishlist={() => toggleWishlist(character.id)}
                />
              ))}
            </div>
          ))}
      </div>

      {/* --- BOTTOM NAV --- */}
      {/* Centered floating navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-full flex justify-center pointer-events-none">
        <div className="bg-[#2d0f41]/30 backdrop-blur-xl border border-white/20 rounded-2xl px-10 py-3 flex gap-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] pointer-events-auto hover:bg-[#2d0f41]/50 transition-colors">
          {/* Home Icon */}
          <button
            onClick={() => setActiveTab("home")}
            className="relative flex flex-col items-center justify-center group"
          >
            <Home
              className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
                activeTab === "home"
                  ? "text-pink-300 scale-110 drop-shadow-[0_0_8px_rgba(249,168,212,0.6)]"
                  : "text-gray-400 hover:text-pink-200"
              }`}
            />
            {activeTab === "home" && (
              <span className="absolute -bottom-2 w-1 h-1 bg-pink-300 rounded-full shadow-[0_0_10px_rgba(249,168,212,0.8)]"></span>
            )}
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => setActiveTab("wishlist")}
            className="relative flex flex-col items-center justify-center group"
          >
            <Heart
              className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
                activeTab === "wishlist"
                  ? "text-pink-500 fill-pink-500 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                  : "text-gray-400 hover:text-pink-300"
              }`}
            />
            {activeTab === "wishlist" && (
              <span className="absolute -bottom-2 w-1 h-1 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- INDIVIDUAL CARD COMPONENT (Reused) ---
const CharacterCard = ({ character, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();
  return (
    <div className="relative bg-[#2e1a47] rounded-2xl p-3 flex flex-col items-center shadow-lg border border-white/5 overflow-hidden group hover:border-pink-500/50 hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist();
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90 hover:bg-black/40"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-300"
          }`}
        />
      </button>

      <div className="relative w-full h-40 md:h-48 flex items-end justify-center mb-2">
        <div className="absolute bottom-0 w-24 md:w-32 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-[50%] opacity-80 blur-[1px] group-hover:opacity-100 transition-opacity"></div>
        <img
          src={character.image}
          alt={character.name}
          className="relative z-0 h-45 md:h-52 w-auto object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="w-full mt-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black text-lg md:text-xl text-purple-100 uppercase tracking-wide truncate max-w-[70%]">
            {character.name}
          </h3>
          <span className="text-[10px] md:text-xs px-2 py-0.5 rounded border border-gray-500 text-gray-300 group-hover:border-pink-400 group-hover:text-pink-200 transition-colors">
            {character.isPaid ? "Paid" : "Free"}
          </span>
        </div>
        <button
          disabled={character.isPaid}
          onClick={() => {
            if (!character.isPaid) navigate(`/app/${character.slug}`);
          }}
          className={`w-full rounded-full py-1.5 px-4 flex justify-between items-center group/btn transition-all
    ${
      character.isPaid
        ? "bg-gray-600 opacity-50 cursor-not-allowed"
        : "bg-gradient-to-r from-pink-400 to-purple-500 hover:shadow-lg hover:shadow-pink-500/25"
    }`}
        >
          <span className="text-xs md:text-sm font-bold text-white">
            {character.isPaid ? "Locked" : "Select"}
          </span>
          <ArrowRight
            className={`w-5 h-5 text-white transition-transform ${character.isPaid ? "" : "group-hover/btn:translate-x-1"}`}
          />
        </button>
      </div>
    </div>
  );
};

export default Avatars;
