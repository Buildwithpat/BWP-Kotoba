const express = require("express");
require("./db");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const datasets = require("./data/loader");
const GameStats = require("./models/GameStats");

let analytics = {
  totalGames: 50,
  totalRounds: 300,
};

const app = express();
app.use(cors({
  origin:
  "https://bwp-kotoba.vercel.app",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://bwp-kotoba.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ================= CONSTANTS ================= */

const ROUND_TIMERS = [40, 35, 30, 25, 20, 15];
const SPEED_TIMERS = [20, 18, 16, 14, 12, 10];
const ROUND_LENGTHS = [3, 4, 5, 6, 7, 8];

const CATEGORY_LIST = ["animals", "cities", "countries", "fruits", "sports"];

const rooms = {};

/* ================= ROOM CREATE ================= */

function createRoom(socket, name, avatar) {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

  rooms[roomId] = {
    host: socket.id,
    players: [
      {
        id: socket.id,
        name,
        avatar,
        host: true,
        eliminated: false,
        score: 0,
      },
    ],
    chat: [],
  };

  socket.join(roomId);

  return {
    roomId,
    players: rooms[roomId].players,
    host: socket.id,
  };
}

/* ================= SOCKET ================= */

io.on("connection", (socket) => {
  socket.on("createRoom", ({ name, avatar }, cb) => {
    const room = createRoom(socket, name, avatar);

    // ⭐ VERY IMPORTANT — SEND ROOM UPDATE
    io.to(room.roomId).emit("roomUpdate", {
      players: room.players,
      host: room.host,
    });

    cb(room);
  });

  socket.on("joinRoom", ({ roomId, name, avatar }, cb) => {
    const room = rooms[roomId];
    if (!room) return cb({ error: "Room not found" });

    const alreadyJoined = room.players.find((p) => p.id === socket.id);

    if (!alreadyJoined) {
      room.players.push({
        id: socket.id,
        name,
        avatar,
        eliminated: false,
        score: 0,
      });
    }

    socket.join(roomId);

    // ⭐ THIS IS THE CRITICAL FIX
    // Always send latest room state AFTER join
    io.to(roomId).emit("roomUpdate", {
      players: room.players,
      host: room.host,
    });

    cb({
      roomId,
      players: room.players,
      host: room.host,
    });
  });
  /* ================= START GAME ================= */

  socket.on("startGame", ({ roomId, mode }) => {
    const room = rooms[roomId];
    if (!room) return;

    // ⭐ SAFE LETTERS ONLY
    const letters = "ABCDEFGHIKLMNOPRSTUWY";

    room.game = {
      mode,
      turnIndex: 0,
      currentRound: 0,
      currentLetter: letters[Math.floor(Math.random() * letters.length)],
      usedWords: new Set(),
      timerInterval: null,
    };

    io.to(roomId).emit("gameStarted", {
      roomId,
      players: room.players,
      game: room.game,
    });

    setTimeout(() => startTurn(roomId), 500);
  });

  /* ================= SUBMIT WORD ================= */

  socket.on("submitWord", ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[room.game.turnIndex];
    if (socket.id !== player.id) return;

    const clean = word.toUpperCase().trim();
    const lower = clean.toLowerCase();

    if (room.game.usedWords.has(clean)) {
      socket.emit("wordRejected");
      return;
    }

    /* ===== CATEGORY ===== */

    if (room.game.mode === "Category Rush") {
      const cat = room.game.category;
      if (!datasets[cat].has(lower)) {
        socket.emit("wordRejected");
        return;
      }
    } else {
      /* ===== WORD MODES ===== */
      const len = ROUND_LENGTHS[room.game.currentRound];

      if (clean.length < len) {
        socket.emit("wordRejected");
        return;
      }

      if (!clean.startsWith(room.game.currentLetter)) {
        socket.emit("wordRejected");
        return;
      }

      if (!datasets.words.has(lower)) {
        socket.emit("wordRejected");
        return;
      }

      room.game.currentLetter = clean.slice(-1);
    }

    room.game.usedWords.add(clean);

    // ===== SCORE CALCULATION =====

const remaining = room.game.currentTimer;
const speedBonus = Math.max(1, Math.floor(remaining / 2));

const points = 2 + speedBonus;

player.score += points;

    io.to(roomId).emit("wordAccepted", {
      word: clean,
      nextLetter: room.game.currentLetter,
    });

    room.chat.push({
      type: "word",
      name: player.name,
      text: clean,
    });

    io.to(roomId).emit("chatUpdate", room.chat);

    nextTurn(roomId);
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];

      const index = room.players.findIndex((p) => p.id === socket.id);
      if (index === -1) continue;

      const wasHost = room.host === socket.id;

      // remove player
      room.players.splice(index, 1);

      // ⭐ IF HOST LEFT → ASSIGN NEW HOST
      if (wasHost && room.players.length > 0) {
        room.host = room.players[0].id;
        room.players[0].host = true;
      }

      io.to(roomId).emit("roomUpdate", {
        players: room.players,
        host: room.host,
      });

      break;
    }
  });

  socket.on("toggleReady", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    player.ready = !player.ready;

    io.to(roomId).emit("roomUpdate", {
      players: room.players,
      host: room.host,
    });
  });

  socket.on("updateSettings", ({ roomId, mode, difficulty, maxPlayers }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.settings = { mode, difficulty, maxPlayers };

    io.to(roomId).emit("settingsUpdate", room.settings);
  });

  socket.on("kickPlayer", ({ roomId, playerId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);

    io.to(playerId).emit("kicked");

    io.to(roomId).emit("roomUpdate", {
      players: room.players,
      host: room.host,
    });
  });

  /* ================= CHAT ================= */

  socket.on("sendChat", ({ roomId, text }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const message = {
      type: "message",
      name: player.name,
      text,
    };

    room.chat.push(message);

    io.to(roomId).emit("chatUpdate", room.chat);
  });

  socket.on("leaveRoom", ({ roomId }) => {
  socket.leave(roomId);
});

});

/* ================= TURN LOGIC ================= */
function startTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const player = room.players[room.game.turnIndex];
  const round = room.game.currentRound;

  /* ================= CLEAR OLD TIMER ================= */
  if (room.game.timerInterval) {
    clearInterval(room.game.timerInterval);
  }

  /* ================= GET TIMER VALUE ================= */

  let timer =
    room.game.mode === "Speed Run"
      ? SPEED_TIMERS[Math.min(round, SPEED_TIMERS.length - 1)]
      : ROUND_TIMERS[Math.min(round, ROUND_TIMERS.length - 1)];

  /* ================= SAVE TIMER FOR SCORING ================= */
  room.game.currentTimer = timer;

  /* ================= CATEGORY MODE ================= */
  if (room.game.mode === "Category Rush") {
    room.game.category =
      CATEGORY_LIST[Math.floor(Math.random() * CATEGORY_LIST.length)];
  }

  /* ================= SEND TURN DATA ================= */
  io.to(roomId).emit("turnStarted", {
    playerId: player.id,
    timer,
    round: round + 1,
    wordLength: ROUND_LENGTHS[Math.min(round, ROUND_LENGTHS.length - 1)],
    category: room.game.category || null,
    mode: room.game.mode,
  });

  /* ================= START TIMER LOOP ================= */
  room.game.timerInterval = setInterval(() => {
    timer--;

    // ⭐ VERY IMPORTANT — keep updating remaining time
    room.game.currentTimer = timer;

    io.to(roomId).emit("timerUpdate", timer);

    if (timer <= 0) {
      clearInterval(room.game.timerInterval);

      player.eliminated = true;

      io.to(roomId).emit("playerEliminated", {
        playerId: player.id,
      });

      nextTurn(roomId);
    }
  }, 1000);
}

function nextTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  let roundEnded = false; // ⭐ MUST BE OUTSIDE LOOP

  do {
    room.game.turnIndex++;

    if (room.game.turnIndex >= room.players.length) {
      room.game.turnIndex = 0;
      room.game.currentRound++;
      roundEnded = true;
    }
  } while (room.players[room.game.turnIndex].eliminated);

  /* ================= ROUND SCORE ================= */

  if (roundEnded) {
    room.chat.push({
      type: "scoreHeader",
      text: `Round ${room.game.currentRound} Score`,
    });

    room.players.forEach((p) => {
      room.chat.push({
        type: "score",
        name: p.name,
        score: p.score,
      });
    });

    io.to(roomId).emit("chatUpdate", room.chat);
  }

  /* ================= CHECK WINNER ================= */

  const alive = room.players.filter((p) => !p.eliminated);

  if (alive.length === 1) {
    /* ================= SAVE ANALYTICS ================= */

    analytics.totalGames += 1;
    analytics.totalRounds += room.game.currentRound + 1;

    new GameStats({
      players: room.players.length,
      rounds: room.game.currentRound + 1,
      mode: room.game.mode,
    }).save();

    /* ================= SEND GAME END ================= */

    io.to(roomId).emit("gameEnded", {
      winner: alive[0].name,
      players: room.players,
      rounds: room.game.currentRound + 1,
      mode: room.game.mode,
    });

    return;
  }

  startTurn(roomId);
}

/* ================= START SERVER ================= */

/* ================= ANALYTICS API ================= */

app.get("/analytics", async (req, res) => {
  const data = await Analytics.findOne();
  res.json(data);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
