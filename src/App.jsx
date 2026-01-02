import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home.jsx";
import Avatars from "./routes/Avatars.jsx";
import Charachter from "./routes/Charachter.jsx";
import AnimationTest from "./components/animationtest.jsx";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/app" element={<Avatars />} />
//       <Route path="/app/:slug" element={<Charachter />} />
//     </Routes>
//   );
// } old one 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<Avatars />} />
      <Route path="/app/:slug" element={<Charachter />} />

      {/* TEMP animation test route */}
      <Route path="/test-animation" element={<AnimationTest />} />
    </Routes>
  );
}
