import { useState, useEffect } from "react";
import socket from "../socket";
import { useLocation, useNavigate } from "react-router-dom";

function Room() {
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { playerName, avatar } = location.state || {};

  /* ================= CREATE ROOM ================= */
  const createRoomHandler = () => {
    if (!playerName) {
      alert("Player info missing. Go back and set identity.");
      navigate("/");
      return;
    }

    socket.emit(
      "createRoom",
      {
        name: playerName,
        avatar: avatar,
      },
      (room) => {
        navigate("/lobby", {
          state: {
            roomId: room.roomId,
            players: room.players,
            host: room.host,
            playerName,
            avatar,
          },
        });
      },
    );
  };

  /* ================= JOIN ROOM ================= */
  const joinRoom = () => {
    if (!roomCode.trim()) return;

    socket.emit(
      "joinRoom",
      {
        roomId: roomCode,
        name: playerName,
        avatar: avatar,
      },
      (response) => {
        if (response?.error) {
          alert(response.error);
          return;
        }

        navigate("/lobby", {
          state: {
            roomId: roomCode,
            playerName,
            avatar,
          },
        });
      },
    );
  };

  /* ================= MODES ================= */
  const modes = [
    {
      title: "WORD DUEL",
      desc: "Turn-based word chain mode.",
      left: [
        "Word must start with the last letter of the previous word",
        "Timed turns",
        "Invalid word ends turn",
      ],
      right: [
        "Minimum word length increases over rounds",
        "Duplicate words not allowed",
      ],
    },
    {
      title: "SPEED RUN",
      desc: "Simultaneous elimination mode.",
      left: [
        "All players answer at the same time",
        "Short timer per round",
        "Invalid or late submission eliminated",
      ],
      right: ["Rounds continue until one player remains", "Last player wins"],
    },
    {
      title: "CATEGORY RUSH",
      desc: "Category-based word challenge.",
      left: [
        "Word must match the given category",
        "Timed turns",
        "No duplicate words allowed",
      ],
      right: ["Invalid word rejected", "Fast-paced gameplay"],
    },
  ];

  return (
    <section className="room-page page">
      <h1 className="room-logo">KOTOBA</h1>
      <p className="room-sub desc">Enter the room</p>

      {/* CREATE / JOIN */}
      <div className="room-top">
        <div className="room-card">
          <h3>CREATE ROOM</h3>
          <p className="desc">
            Start a private game <br /> and be the BOSS
          </p>
          <button className="room-btn" onClick={createRoomHandler}>
            CREATE
          </button>
        </div>

        <div className="room-card">
          <h3>JOIN ROOM</h3>
          <p className="desc">Enter a room code</p>

          <input
            className="room-input"
            value={roomCode}
            onChange={(e) =>
              setRoomCode(e.target.value.toUpperCase().replace(/\s/g, ""))
            }
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />

          <button className="room-btn" onClick={joinRoom}>
            JOIN
          </button>
        </div>
      </div>

      <div className="divider" />

      <h2 className="modes-title">Game Modes</h2>

      <div className="modes-container">
        {modes.map((mode, i) => (
          <div key={i} className="mode-card">
            <h3>{mode.title}</h3>
            <p className="desc">{mode.desc}</p>

            <div className="mode-grid">
              <ul>
                {mode.left.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <ul>
                {mode.right.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Room;
