import { useState } from "react";
import ShinchanModel from "./ShinchanModel";

export default function AnimationTest() {
  const [animation, setAnimation] = useState("default");

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-[300px] h-[400px]">
        <ShinchanModel animation={animation} />
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={() => setAnimation("default")} className="px-4 py-2 bg-purple-600 text-white rounded">
          Wave
        </button>
        <button onClick={() => setAnimation("dance")} className="px-4 py-2 bg-pink-600 text-white rounded">
          Dance
        </button>
        <button onClick={() => setAnimation("Talking")} className="px-4 py-2 bg-blue-600 text-white rounded">
          Talk
        </button>
        <button onClick={() => setAnimation("listen")} className="px-4 py-2 bg-green-600 text-white rounded">
          Listen
        </button>
      </div>
    </div>
  );
}
