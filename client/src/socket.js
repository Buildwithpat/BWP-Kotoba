import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: true, // ⭐ CHANGE THIS
  transports: ["websocket"],
});

export default socket;
