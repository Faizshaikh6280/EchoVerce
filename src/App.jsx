import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home.jsx";
import Avatars from "./routes/Avatars.jsx";
import Charachter from "./routes/Charachter.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<Avatars />} />
      <Route path="/app/:slug" element={<Charachter />} />
    </Routes>
  );
}
