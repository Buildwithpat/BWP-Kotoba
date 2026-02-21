import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";

function Landing() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalGames: 50,
    totalRounds: 300,
  });


  return (
    <>
      {/* HERO */}
      <Hero onPlay={() => navigate("/identity")} />

      {/* ABOUT */}
      <AboutSection />
    </>
  );
}

export default Landing;
