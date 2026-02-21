function AboutSection() {
  const points = [
    {
      id: 1,
      title: "Real-Time Word Battles",
      desc: "Compete live with friends in fast-paced, turn-based word challenges that test both speed and thinking.",
    },
    {
      id: 2,
      title: "Five Distinct Modes",
      desc: "From classic word chains to dynamic constraints, each mode offers a different way to compete.",
    },
    {
      id: 3,
      title: "No Accounts. No Clutter.",
      desc: "Choose an identity, enter a room, and start playing. Nothing stored. Nothing complicated.",
    },
    {
      id: 4,
      title: "Built for Focus",
      desc: "A distraction-free interface designed to keep your mind sharp and your attention locked in.",
    },
    {
      id: 5,
      title: "Skill Over Luck",
      desc: "Victory depends on vocabulary, logic, and composure — not randomness.",
    },
    {
      id: 6,
      title: "Play Anywhere",
      desc: "Fully responsive design built for both desktop and mobile. Compete wherever you are.",
    },
  ];

  return (
    <section className="about">
      <h2 className="about-title">What is KOTOBA?</h2>

      <p className="about-sub desc">
        Sharpen your mind with every round. Improve your typing speed without
        even trying.
      </p>

      <div className="about-grid">
        {points.map((item) => (
          <div key={item.id} className="about-card">
            <div className="card-number">{item.id}</div>
            <h3>{item.title}</h3>
            <p className="desc">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="about-note">
        Kotoba uses a curated English dictionary. <br />
        Some slang, abbreviations, or rare words may not be accepted.
      </p>
    </section>
  );
}

export default AboutSection;
