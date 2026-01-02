import React, { useState, useMemo } from "react";
import { Search, Heart, Home, ArrowRight, Ghost } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- MOCK DATA ---
const INITIAL_DATA = [
  {
    id: 1,
    name: "SHINCHAN",
    category: "Funny",
    isPaid: true,
    image: "/images/shinchan.png",
    slug: "shinchan",
  },
  {
    id: 2,
    name: "MOTU",
    category: "Funny",
    isPaid: false,
    image: "/images/shinchan.png",
    slug: "motu",
  },
  {
    id: 3,
    name: "GANDHI JI",
    category: "Calm",
    isPaid: true,
    image: "/images/shinchan.png",
    slug: "ghandhiji",
  },
  {
    id: 4,
    name: "BUDDHA JI",
    category: "Calm",
    isPaid: false,
    image: "/images/shinchan.png",
    slug: "buddhaji",
  },
  {
    id: 5,
    name: "HONEY SINGH",
    category: "Energetic",
    isPaid: true,
    image: "/images/shinchan.png",
    slug: "honeysingh",
  },
  {
    id: 6,
    name: "DORAEMON",
    category: "Energetic",
    isPaid: false,
    image: "/images/shinchan.png",
    slug: "doraemon",
  },
  {
    id: 7,
    name: "OGGY",
    category: "Emotional",
    isPaid: true,
    image: "/images/shinchan.png",
    slug: "oggy",
  },
  {
    id: 8,
    name: "ARIJIT SINGH",
    category: "Emotional",
    isPaid: false,
    image: "/images/shinchan.png",
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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-20 bg-[#1a0b2e] pt-6 px-4 pb-2">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder={
              activeTab === "home"
                ? "Search Your Partner"
                : "Search in Wishlist"
            }
            className="w-full bg-[#2a1b3d] border border-gray-600 rounded-full py-3 pl-5 pr-12 text-gray-300 focus:outline-none focus:border-purple-400 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>

        {/* Show Filters only on Home Tab */}
        {activeTab === "home" ? (
          <>
            <h1 className="text-xl text-center font-black mb-4 tracking-wide font-light text-accent uppercase font-primary">
              Pick one that matches your mood!
            </h1>
            {/* Filter Pills Container */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 touch-pan-x">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                    activeFilter === filter
                      ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold shadow-lg shadow-purple-500/30"
                      : "bg-[#2a1b3d] text-gray-400 border border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </>
        ) : (
          <h1 className="text-xl font-black mb-4 tracking-wide text-pink-200 uppercase">
            Your Wishlist
          </h1>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="px-4 space-y-6 mt-2">
        {/* VIEW: HOME TAB */}
        {activeTab === "home" &&
          (Object.keys(groupedHomeData).length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No partners found.
            </div>
          ) : (
            Object.entries(groupedHomeData).map(([category, items]) => (
              <div key={category} className="animate-fade-in">
                <div className="flex justify-between items-end mb-3 border-b-2 border-purple-900/50 pb-1">
                  <h2 className="text-lg font-bold text-pink-200 capitalize">
                    {category} Partners
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
            <div className="flex flex-col items-center justify-center mt-20 opacity-50">
              <Ghost className="w-16 h-16 text-purple-400 mb-4" />
              <p className="text-gray-400 text-lg">Your wishlist is empty.</p>
              <button
                onClick={() => setActiveTab("home")}
                className="mt-4 text-pink-400 underline text-sm"
              >
                Go explore partners
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
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
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        {/* Glass Effect Changes:
      1. bg-[#2d0f41]/30 -> Low opacity allows background to show through
      2. backdrop-blur-xl -> Blurs the content behind the nav
      3. border-white/20 -> A slightly clearer border defines the glass edge
      4. shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] -> Adds depth/lift
  */}
        <div className="bg-[#2d0f41]/30 backdrop-blur-xl border border-white/20 rounded-2xl px-10 py-3 flex gap-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* Home Icon */}
          <button
            onClick={() => setActiveTab("home")}
            className="relative flex flex-col items-center justify-center group"
          >
            <Home
              className={`w-6 h-6 transition-all duration-300 ${
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
              className={`w-6 h-6 transition-all duration-300 ${
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
    <div className="relative bg-[#2e1a47] rounded-2xl p-3 flex flex-col items-center shadow-lg border border-white/5 overflow-hidden group hover:border-pink-500/30 transition-colors">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist();
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-300"
          }`}
        />
      </button>

      <div className="relative w-full h-40 flex items-end justify-center mb-2">
        <div className="absolute bottom-0 w-24 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-[50%] opacity-80 blur-[1px]"></div>
        <img
          src={character.image}
          alt={character.name}
          className="relative z-0 h-45 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="w-full mt-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black text-lg text-purple-100 uppercase tracking-wide truncate max-w-[70%]">
            {character.name}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded border border-gray-500 text-gray-300">
            {character.isPaid ? "Paid" : "Free"}
          </span>
        </div>
        <button
          onClick={() => {
            navigate(`/app/${character.slug}`);
          }}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full py-1.5 px-4 flex justify-between items-center group/btn"
        >
          <span className="text-xs font-bold text-white">Select</span>
          <ArrowRight className="w-5 h-5 text-white group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Avatars;
