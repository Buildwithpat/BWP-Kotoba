import { io } from "socket.io-client";

const socket = io("https://bwp-kotoba.onrender.com", {
  autoConnect: true,
  reconnection: true,
});

export default socket;
