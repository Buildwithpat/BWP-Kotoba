import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <h1 className="hero-title">KOTOBA</h1>

      <p className="hero-tagline">For the bored. And the brave.</p>

      <p className="hero-sub desc">Think Fast. Type Smart.</p>

      <button className="primary-btn" onClick={() => navigate("/identity")}>
        PLAY NOW
      </button>

    </section>
  );
}

export default Hero;
