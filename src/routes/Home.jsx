import React, { useState } from "react";
import SplashScreen1 from "../components/ui/SplashScreen1.jsx";
import SplashScreen2 from "../components/ui/SplashScreen2.jsx";

const Home = () => {
  // We track which screen to show: 'splash1', 'splash2', or 'app'
  const [currentScreen, setCurrentScreen] = useState("splash1");

  return (
    <>
      {/* 1. Show First Splash Screen */}
      {currentScreen === "splash1" && (
        <SplashScreen1 onComplete={() => setCurrentScreen("splash2")} />
      )}

      {/* 2. Show Second Splash Screen */}
      {currentScreen === "splash2" && (
        <SplashScreen2 onComplete={() => setCurrentScreen("app")} />
      )}
    </>
  );
};

export default Home;
