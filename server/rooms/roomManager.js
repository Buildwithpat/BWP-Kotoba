const { nanoid } = require("nanoid");

const rooms = {};

/* =========================
   CREATE ROOM
========================= */
function createRoom(socket, playerName) {
  const roomId = nanoid(6).toUpperCase();

  rooms[roomId] = {
    id: roomId,
    host: socket.id,
    status: "waiting",
    players: [
      {
        id: socket.id,
        name: playerName,
        ready: false,
      },
    ],
  };

  socket.join(roomId);

  return rooms[roomId];
}

/* =========================
   JOIN ROOM
========================= */
function joinRoom(socket, roomId, playerName) {
  const room = rooms[roomId];

  if (!room) return { error: "Room does not exist" };
  if (room.status === "playing") return { error: "Game already started" };
  if (room.players.length >= 10) return { error: "Room full" };

  room.players.push({
    id: socket.id,
    name: playerName,
    ready: false,
  });

  socket.join(roomId);

  return room;
}

/* =========================
   REMOVE PLAYER
========================= */
function removePlayer(socketId) {
  for (const roomId in rooms) {
    const room = rooms[roomId];

    const index = room.players.findIndex((p) => p.id === socketId);
    if (index !== -1) {
      room.players.splice(index, 1);

      if (room.players.length === 0) {
        delete rooms[roomId];
      }

      return roomId;
    }
  }
}

/* =========================
   GET ROOM
========================= */
function getRoom(roomId) {
  return rooms[roomId];
}

module.exports = {
  createRoom,
  joinRoom,
  removePlayer,
  getRoom,
};
