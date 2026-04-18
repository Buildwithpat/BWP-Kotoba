import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

import { useLocation } from "react-router-dom";
import socket from "../socket";

function Game() {
  const location = useLocation();

  const navigate = useNavigate();

  // Add this with your other useState hooks
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const initialPlayers = location.state?.players || [];
  const roomId = location.state?.roomId || null;
  const game = location.state?.game || null;
  const [myTurn, setMyTurn] = useState(false);

  const [currentWord, setCurrentWord] = useState("");
  const [displayWord, setDisplayWord] = useState("");
  const [shake, setShake] = useState(false);
  const [fade, setFade] = useState(false);
  const [timer, setTimer] = useState(30);
  const [currentLetter, setCurrentLetter] = useState(game?.currentLetter || "");
  const [isLight, setIsLight] = useState(
    document.body.classList.contains("light"),
  );
  // const myIdRef = useRef(null);
  const [requiredLength, setRequiredLength] = useState(3);

  const [round, setRound] = useState(1);

  const [chatText, setChatText] = useState("");
  const [mode, setMode] = useState(game?.mode || "Word Duel");
  const [myId, setMyId] = useState("");

  const sendChat = () => {
    if (!chatText.trim()) return;

    socket.emit("sendChat", {
      roomId,
      text: chatText,
    });

    setChatText("");
  };

  useEffect(() => {
    if (socket.id) {
      setMyId(socket.id);
    }

    const handleConnect = () => {
      setMyId(socket.id);
    };

    socket.on("connect", handleConnect);

    return () => socket.off("connect", handleConnect);
  }, []);

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

  const inputRef = useRef(null); // 👈 ADD HERE

  // useEffect(() => {
  //   inputRef.current?.focus(); // 👈 ADD THIS
  // }, []);

  const [players, setPlayers] = useState(initialPlayers);
  const [chat, setChat] = useState([]);

  useEffect(() => {
    if (initialPlayers.length) {
      setPlayers(initialPlayers);
    }
  }, [initialPlayers]);

  useEffect(() => {
    socket.on("chatUpdate", (data) => {
      setChat(data);
    });

    return () => socket.off("chatUpdate");
  }, []);

  const [category, setCategory] = useState(null);

  useEffect(() => {
    socket.on("gameStarted", (data) => {
      setPlayers([...data.players]);
      setCurrentLetter(data.game.currentLetter);
      setRequiredLength(data.wordLength || 3);
      setMode(data.game.mode);
    });

    return () => socket.off("gameStarted");
  }, []);

  /* =========================
        TIMER
  ========================== */
  /* =========================
      TURN & TIMER LOGIC
========================== */
  useEffect(() => {
    const handleTurn = (data) => {
      setMode(data.mode);
      setTimer(data.timer);
      setRequiredLength(data.wordLength);
      setRound(data.round);
      setCategory(data.category || null);

      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          turn: p.id === data.playerId,
        })),
      );

      // Calculate if it is my turn
      const isItMyTurn = data.playerId === socket.id;
      setMyTurn(isItMyTurn);

      // ⚡ AUTO-FOCUS LOGIC
      if (isItMyTurn) {
        // Smallest possible delay to ensure React has enabled the input
        // before we try to pull the cursor into it.
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      }
    };

    const handleTimer = (time) => {
      setTimer(time);
    };

    socket.on("turnStarted", handleTurn);
    socket.on("timerUpdate", handleTimer);

    return () => {
      socket.off("turnStarted", handleTurn);
      socket.off("timerUpdate", handleTimer);
    };
  }, []); // Empty dependency array is fine since we use socket.id inside the handler

  const triggerShake = () => {
    if (shake) return;

    setShake(true);
    setTimeout(() => setShake(false), 350);
  };
  /* =========================
        WORD SUBMIT
  ========================== */
  const handleSubmit = (e) => {
    if (e.key !== "Enter") return;
    if (!myTurn) return;

    const word = currentWord.trim().toUpperCase();

    // ❌ EMPTY WORD
    if (!word) {
      triggerShake();
      return;
    }

    // ================= WORD DUEL + SPEED RUN =================
    if (mode === "Word Duel" || mode === "Speed Run") {
      // LENGTH RULE
      if (word.length < requiredLength) {
        triggerShake();
        return;
      }

      // START LETTER RULE
      if (!word.startsWith(currentLetter)) {
        triggerShake();
        return;
      }
    }

    // ================= CATEGORY RUSH =================
    if (mode === "Category Rush") {
      // Must have category active
      if (!category) {
        triggerShake();
        return;
      }

      // Category mode still needs minimum length
      if (word.length < requiredLength) {
        triggerShake();
        return;
      }
    }

    // ================= SEND TO SERVER =================
    socket.emit("submitWord", {
      roomId,
      word,
    });
  };

  useEffect(() => {
    const handleReject = () => {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    };

    socket.off("wordRejected");
    socket.on("wordRejected", handleReject);

    return () => socket.off("wordRejected", handleReject);
  }, []);

  useEffect(() => {
    const handleEliminate = ({ playerId }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, eliminated: true } : p)),
      );
    };

    socket.on("playerEliminated", handleEliminate);

    return () => socket.off("playerEliminated", handleEliminate);
  }, []);

  useEffect(() => {
    const handleEnd = ({ winner, players, rounds, mode }) => {
      navigate("/complete", {
        state: {
          players,
          rounds,
          mode,
        },
      });
    };

    socket.on("gameEnded", handleEnd);

    return () => socket.off("gameEnded", handleEnd);
  }, []);

  useEffect(() => {
    const handleWord = (data) => {
      setDisplayWord(data.word);
      setCurrentLetter(data.nextLetter);

      setFade(false);

      // Show word first
      setTimeout(() => {
        setFade(true);
      }, 400);

      // Clear after fade
      setTimeout(() => {
        setDisplayWord("");
        setFade(false);
      }, 1200);

      setCurrentWord("");
    };

    socket.on("wordAccepted", handleWord);

    return () => socket.off("wordAccepted", handleWord);
  }, []);

  // useEffect(() => {
  //   const assignId = () => {
  //     myIdRef.current = socket.id;
  //   };

  //   if (socket.connected) {
  //     assignId();
  //   }

  //   socket.on("connect", assignId);

  //   return () => socket.off("connect", assignId);
  // }, []);

  // useEffect(() => {
  //   if (!initialPlayers.length) return;

  //   const waitForId = () => {
  //     if (socket.id) {
  //       myIdRef.current = socket.id;
  //       setPlayers(initialPlayers);
  //     }
  //   };

  //   waitForId();

  //   socket.on("connect", waitForId);

  //   return () => socket.off("connect", waitForId);
  // }, [initialPlayers]);

  if (!roomId) {
    return <div style={{ padding: 50 }}>Loading Game...</div>;
  }

  return (
    <section className="game-page page">
      {/* TOP STRIP */}
      <div className="game-top">
        <div className="game-avatar">
          <img
            src={
              isLight
                ? avatarsLight[players.find((p) => p.id === myId)?.avatar || 0]
                : avatarsDark[players.find((p) => p.id === myId)?.avatar || 0]
            }
            alt="avatar"
          />
        </div>

        <div className="game-title">{mode}</div>

        <div className={`game-timer ${timer <= 5 ? "warning" : ""}`}>
          {timer}s
        </div>
      </div>

      {/* WORD INPUT */}
      <div className="word-area" onClick={() => inputRef.current?.focus()}>
        <div
          className={`word-display ${shake ? "shake" : ""} ${fade ? "fade-out" : ""}`}
        >
          {/* If there's an accepted word, show it. Otherwise, show current typing OR the placeholder */}
          {displayWord || (currentWord ? currentWord : "-o-")}
        </div>

        <input
          ref={inputRef}
          className="word-input"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
          onKeyDown={handleSubmit}
          disabled={!myTurn}
          maxLength={14}
        />
      </div>

      {/* RULE */}
      <p className="game-rule desc">
        {mode === "Category Rush" && category && (
          <>
            Name a <b>{category}</b>
          </>
        )}

        {(mode === "Word Duel" || mode === "Speed Run") && (
          <>
            Start with <b>{currentLetter}</b> • Min length{" "}
            <b>{requiredLength}</b>
          </>
        )}
      </p>

      {/* BOTTOM GRID */}
      <div className="game-grid">
        {/* PLAYERS CARD */}
        <div className="game-card players-card">
          <div className="round-label">Round {round}</div>

          <div className="players-list">
            {players.map((player) => (
              <div
                key={player.id}
                className={`player-item 
                    ${player.turn ? "active-turn" : ""} 
                    ${player.eliminated ? "eliminated" : ""}`}
              >
                <div className="player-left">
                  <div className="player-dot"></div>
                  <img
                    className="player-avatar"
                    src={
                      isLight
                        ? avatarsLight[player.avatar || 0]
                        : avatarsDark[player.avatar || 0]
                    }
                    alt="avatar"
                  />
                  {/* here I wrote for list avatars */}

                  <span className="player-name">{player.name}</span>

                  {player.eliminated && (
                    <span className="host-badge">ELIMINATED</span>
                  )}
                </div>

                {!player.eliminated && player.turn && (
                  <span className="turn-arrow">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CHAT CARD */}
        {/* CHAT CARD */}
        <div className={`game-card chat-card ${isChatOpen ? "open" : ""}`}>
          <div className="chat-header">
            <h3>ROOM CHAT</h3>
            {/* X button to close the drawer on mobile */}
            <button className="close-chat" onClick={() => setIsChatOpen(false)}>
              ×
            </button>
          </div>

          <div className="chat-divider"></div>

          <div className="chat-list">
            {chat.map((msg, i) => {
              if (msg.type === "word") {
                return (
                  <div key={i} className="chat-message">
                    <span className="chat-name">{msg.name}: </span>
                    <span className="chat-text">{msg.text}</span>
                  </div>
                );
              }

              if (msg.type === "scoreHeader") {
                return (
                  <div key={i} className="chat-score-header">
                    {msg.text}
                  </div>
                );
              }

              if (msg.type === "score") {
                return (
                  <div key={i} className="chat-score">
                    {msg.name}: {msg.score}
                  </div>
                );
              }

              if (msg.type === "message") {
                return (
                  <div key={i} className="chat-message">
                    <span className="chat-name">{msg.name}: </span>
                    <span className="chat-text">{msg.text}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="chat-input-wrapper">
            <input
              className="chat-input"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />
            <button className="chat-send-btn" onClick={sendChat}>
              SEND
            </button>
          </div>
        </div>
      </div>
      {!isChatOpen && (
        <button
          className="mobile-chat-fab"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open Chat"
        >
          ●
        </button>
      )}
    </section>
  );
}

export default Game;
