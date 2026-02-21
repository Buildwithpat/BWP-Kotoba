import { io } from "socket.io-client";

const socket = io("https://bwp-kotoba.onrender.com", {
  autoConnect: true,
});

export default socket;
