import { useState } from "react";
import ShinchanModel from "./ShinchanModel";

export default function AnimationTest() {
  const [animation, setAnimation] = useState("idle");

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      
      {/* MODEL FRAME */}
      <div className="relative w-[280px] h-[420px] overflow-hidden rounded-xl">
        
        {/* 3D MODEL */}
        <ShinchanModel animation={animation} />

        {/* BUTTONS OVER MODEL */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          <button
            onClick={() => setAnimation("idle")}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded"
          >
            Idle
          </button>

          <button
            onClick={() => setAnimation("dance")}
            className="px-3 py-1 bg-pink-600 text-white text-sm rounded"
          >
            Dance
          </button>

          <button
            onClick={() => setAnimation("Talking")}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
          >
            Talk
          </button>

          <button
            onClick={() => setAnimation("listen")}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded"
          >
            Listen
          </button>
        </div>
      </div>
    </div>
  );
}
