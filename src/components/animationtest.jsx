import { useState } from "react";
import ShinchanModel from "./ShinchanModel";

export default function AnimationTest() {
  const [animation, setAnimation] = useState("default"); // 👈 FIX

  return (
    <div className="w-screen h-screen bg-black">
      <ShinchanModel animation={animation} />

      {/* Test Buttons */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={() => setAnimation("default")}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Wave (Default)
        </button>

        <button
          onClick={() => setAnimation("dance")}
          className="px-4 py-2 bg-pink-600 text-white rounded"
        >
          Dance
        </button>

        <button
          onClick={() => setAnimation("talk")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Talk
        </button>

        <button
          onClick={() => setAnimation("listen")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Listen
        </button>
      </div>
    </div>
  );
}
