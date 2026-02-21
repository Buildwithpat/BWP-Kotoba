import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

// DARK avatars
import avatar1Dark from "../assets/avatars/dark/avatar1.svg";
import avatar2Dark from "../assets/avatars/dark/avatar2.svg";
import avatar3Dark from "../assets/avatars/dark/avatar3.svg";
import avatar4Dark from "../assets/avatars/dark/avatar4.svg";
import avatar5Dark from "../assets/avatars/dark/avatar5.svg";
import avatar6Dark from "../assets/avatars/dark/avatar6.svg";
import avatar7Dark from "../assets/avatars/dark/avatar7.svg";
import avatar8Dark from "../assets/avatars/dark/avatar8.svg";

// LIGHT avatars
import avatar1Light from "../assets/avatars/light/avatar1.svg";
import avatar2Light from "../assets/avatars/light/avatar2.svg";
import avatar3Light from "../assets/avatars/light/avatar3.svg";
import avatar4Light from "../assets/avatars/light/avatar4.svg";
import avatar5Light from "../assets/avatars/light/avatar5.svg";
import avatar6Light from "../assets/avatars/light/avatar6.svg";
import avatar7Light from "../assets/avatars/light/avatar7.svg";
import avatar8Light from "../assets/avatars/light/avatar8.svg";

function Identity() {
  const navigate = useNavigate();

  const avatarsDark = [
    avatar1Dark,
    avatar2Dark,
    avatar3Dark,
    avatar4Dark,
    avatar5Dark,
    avatar6Dark,
    avatar7Dark,
    avatar8Dark,
  ];

  const avatarsLight = [
    avatar1Light,
    avatar2Light,
    avatar3Light,
    avatar4Light,
    avatar5Light,
    avatar6Light,
    avatar7Light,
    avatar8Light,
  ];

  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");
  const [isLight, setIsLight] = useState(
    document.body.classList.contains("light"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.body.classList.contains("light"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const avatars = isLight ? avatarsLight : avatarsDark;

  const nextAvatar = () => setIndex((prev) => (prev + 1) % avatars.length);

  const prevAvatar = () =>
    setIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));

  const handleContinue = () => {
  if (!name.trim()) return;

  const selectedAvatar = index;
  sessionStorage.setItem("name", name);
  sessionStorage.setItem("avatar", selectedAvatar);

  const proceed = () => {
    socket.emit(
      "createRoom",
      {
        name: name,
        avatar: selectedAvatar,
      },
      (room) => {
        navigate("/room", {
          state: {
            roomId: room.roomId,
            players: room.players,
            host: room.host,
            playerName: name,
            avatar: selectedAvatar,
          },
        });
      },
    );
  };

  if (socket.connected) {
    proceed();
  } else {
    socket.once("connect", proceed);
  }
};   // ⭐ THIS LINE FIXES EVERYTHING


return (
    <section className="identity-page page">
      <h1 className="identity-logo">KOTOBA</h1>

      <p className="identity-label desc">Select your avatar</p>

      <div className="avatar-section">
        <button className="arrow-btn" onClick={prevAvatar}>
          ‹
        </button>

        <div className="avatar-card">
          <img src={avatars[index]} alt="avatar" className="avatar-img" />
        </div>

        <button className="arrow-btn" onClick={nextAvatar}>
          ›
        </button>
      </div>

      <p className="identity-label desc">Enter your name</p>

      <input
        className="name-input-line"
        value={name}
        maxLength={16}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={handleContinue}
        disabled={!name.trim()}
      >
        CONTINUE
      </button>
    </section>
  );
}


export default Identity;
