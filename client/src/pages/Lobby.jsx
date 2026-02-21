import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import { useLocation, useNavigate } from "react-router-dom";

function Lobby() {
  const location = useLocation();
  const navigate = useNavigate();

  const roomId = location.state?.roomId || "------";
  const playerName = location.state?.playerName;
  const avatar = location.state?.avatar;

  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState(null);

  const isHost = socket.id && hostId === socket.id;

  const [message, setMessage] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const [mode, setMode] = useState("Word Duel");
  const [difficulty, setDifficulty] = useState("Progressive");
  const [maxPlayers, setMaxPlayers] = useState("2 - 10");

  const [openSelect, setOpenSelect] = useState(null);


  /* ================= JOIN ROOM ================= */
  useEffect(() => {
    if (!roomId || !playerName) return;

    const join = () => {
      socket.emit("joinRoom", { roomId, name: playerName, avatar }, (res) => {
        if (res?.error) alert(res.error);
      });
    };

    if (socket.connected) join();
    else socket.once("connect", join);

    return () => socket.off("connect", join);
  }, [roomId, playerName]);

  /* ================= ROOM UPDATE ================= */
  useEffect(() => {
    const handleUpdate = (data) => {
      setPlayers(data.players);
      setHostId(data.host);
    };

    socket.on("roomUpdate", handleUpdate);
    return () => socket.off("roomUpdate", handleUpdate);
  }, []);

  /* ================= GAME START ================= */
  useEffect(() => {
    const handleStart = (data) => {
      navigate("/game", {
        state: {
          players: data.players,
          roomId: data.roomId,
          game: data.game,
        },
      });
    };

    socket.on("gameStarted", handleStart);
    return () => socket.off("gameStarted", handleStart);
  }, []);

  /* ================= SETTINGS SYNC ================= */
  useEffect(() => {
    const handleSettings = (settings) => {
      setMode(settings.mode);
      setDifficulty(settings.difficulty);
      setMaxPlayers(settings.maxPlayers);
    };

    socket.on("settingsUpdate", handleSettings);
    return () => socket.off("settingsUpdate", handleSettings);
  }, []);

  useEffect(() => {
    if (!isHost) return;

    socket.emit("updateSettings", {
      roomId,
      mode,
      difficulty,
      maxPlayers,
    });
  }, [mode, difficulty, maxPlayers]);

  /* ================= KICK EVENT ================= */
  useEffect(() => {
    socket.on("kicked", () => {
      alert("You were removed by the host");
      navigate("/room");
    });

    return () => socket.off("kicked");
  }, []);

  /* ================= HELPERS ================= */
  const copyCode = () => navigator.clipboard.writeText(roomId);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const toggleReady = () => socket.emit("toggleReady", { roomId });

  const handleStart = () => {
    const notReady = players.filter((p) => !p.host && !p.ready);
    if (notReady.length > 0) {
      showMessage("Players are not ready");
      return;
    }

    socket.emit("startGame", {
      roomId,
      mode,
      difficulty,
      maxPlayers,
    });
  };

  /* ================= CUSTOM SELECT ================= */
  const Select = ({ id, label, value, setValue, options }) => {
    return (
      <div className="setting-block">
        <label>{label}</label>

        <div
          className="select-display"
          onClick={() => isHost && setOpenSelect(openSelect === id ? null : id)}
        >
          <span>{value}</span>
          {isHost && <span className="arrow">▾</span>}
        </div>

        {openSelect === id && isHost && (
          <div className="select-options">
            {options.map((opt) => (
              <div
                key={opt}
                className="select-option"
                onClick={() => {
                  setValue(opt);
                  setOpenSelect(null);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ================= UI ================= */
  return (
    <section className="lobby-page page">
      <h1 className="lobby-logo">KOTOBA</h1>

      {message && <div className="lobby-message">{message}</div>}

      <div className="room-code-card">
        <h3>ROOM CODE</h3>

        <div className="room-code-box">
          <input value={roomId} readOnly />
          <button className="secondary-btn" onClick={copyCode}>
            COPY
          </button>
        </div>

        <p className="desc">Share the code to invite players.</p>
      </div>

      <div className="lobby-grid">
        {/* PLAYERS */}
        <div className="players-panel">
          <h3>PLAYERS</h3>
          <p className="desc">{players.length} / 10 Players</p>

          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <div className="player-left">
                  <div className="player-dot"></div>
                  <span className="player-name">{player.name}</span>
                  {player.host && <span className="host-badge">Host</span>}
                </div>

                <div className="player-right">
                  <span
                    className={`player-status ${player.ready ? "ready" : ""}`}
                  >
                    {player.ready ? "Ready" : "Waiting..."}
                  </span>

                  {isHost && !player.host && (
                    <span
                      className="remove-player"
                      onClick={() => setConfirmRemove(player.id)}
                    >
                      ×
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SETTINGS */}
        <div className="settings-panel">
          <h3>GAME SETTINGS</h3>

          <Select
            id="mode"
            label="Mode"
            value={mode}
            setValue={setMode}
            options={["Word Duel", "Speed Run", "Category Rush"]}
          />
          <Select
            id="difficulty"
            label="Difficulty"
            value={difficulty}
            setValue={setDifficulty}
            options={["Progressive", "Fixed"]}
          />
          <Select
            id="players"
            label="Max Players"
            value={maxPlayers}
            setValue={setMaxPlayers}
            options={["2 - 10", "2 - 6", "2 - 4"]}
          />

          {isHost ? (
            <button className="primary-btn" onClick={handleStart}>
              START GAME
            </button>
          ) : (
            <button className="primary-btn" onClick={toggleReady}>
              READY
            </button>
          )}
        </div>
      </div>

      {confirmRemove && (
        <div className="modal-overlay">
          <div className="confirm-card">
            <p className="confirm-title">Are you sure?</p>

            <div className="confirm-actions">
              <button
                className="confirm-btn"
                onClick={() => setConfirmRemove(null)}
              >
                NO
              </button>
              <button
                className="confirm-btn primary"
                onClick={() => {
                  socket.emit("kickPlayer", {
                    roomId,
                    playerId: confirmRemove,
                  });
                  setConfirmRemove(null);
                }}
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Lobby;
