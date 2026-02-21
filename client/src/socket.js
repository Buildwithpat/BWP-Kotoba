import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default socket;
