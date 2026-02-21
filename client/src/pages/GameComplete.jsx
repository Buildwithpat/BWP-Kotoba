import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";

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



function GameComplete() {
const navigate = useNavigate();
const location = useLocation();

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

// ⭐ REAL DATA FROM GAME
const { players = [], rounds = 0, mode = "Word Duel" } =
location.state || {};

// Sort by score descending
const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

const winner = sortedPlayers[0];

/* ================= THEME LISTENER ================= */
const [isLight, setIsLight] = useState(
document.body.classList.contains("light")
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

/* ================= RENDER ================= */

return (
  <section className="game-complete-page page">
    {/* TITLE */}
    <div className="complete-title">GAME COMPLETE</div>
    {/* WINNER */}
    {winner && (
      <div className="winner-section">
        <p className="winner-label">Winner:</p>

        <div className="winner-row">
          <div className="winner-avatar">
            <img
              src={
                isLight
                  ? avatarsLight[winner.avatar || 0]
                  : avatarsDark[winner.avatar || 0]
              }
              alt="winner avatar"
            />
          </div>

          <div className="winner-name">{winner.name}</div>
        </div>
      </div>
    )}
    {/* SCOREBOARD */}
    <div className="complete-card scoreboard-card">
      <div className="card-title">SCOREBOARD</div>

      <div className="score-list">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className="score-row">
            <div className="score-left">
              <span className="score-rank">{index + 1}</span>
              <img
                className="score-avatar"
                src={
                  isLight
                    ? avatarsLight[player.avatar || 0]
                    : avatarsDark[player.avatar || 0]
                }
              />

              <span className="score-name">{player.name}</span>
            </div>

            <div className="score-points">{player.score} pts</div>
          </div>
        ))}
      </div>
    </div>
    {/* MATCH STATS */}
    <div className="complete-card stats-card">
      <div className="card-title">MATCH STATS</div>

      <div className="stat-row">
        <span>Game Mode:</span>
        <span>{mode}</span>
      </div>

      <div className="stat-row">
        <span>Rounds Played:</span>
        <span>{rounds}</span>
      </div>

      <div className="stat-row">
        <span>Total Players:</span>
        <span>{players.length}</span>
      </div>
    </div>
    {/* BUTTONS */}
    <div className="complete-buttons">
      <button
        className="primary-btn"
        onClick={() => {
          const name = sessionStorage.getItem("name");
          const avatar = Number(sessionStorage.getItem("avatar"));

          socket.emit("createRoom", { name, avatar }, (room) => {
            navigate("/lobby", {
              state: {
                roomId: room.roomId,
                playerName: name,
                avatar,
              },
            });
          });
        }}
      >
        PLAY AGAIN
      </button>

      <button
        className="primary-btn"
        onClick={() => {
          socket.emit("leaveRoom", {
            roomId: sessionStorage.getItem("roomId"),
          });

          sessionStorage.clear();

          navigate("/");
        }}
      >
        QUIT
      </button>
    </div>
  </section>
);
}

export default GameComplete;
