// socket.js (Frontend)
import { io } from "socket.io-client";

const URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://bwp-kotoba.onrender.com";

const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  transports: ["websocket"], // Using pure websockets is faster for games
});

export default socket;
