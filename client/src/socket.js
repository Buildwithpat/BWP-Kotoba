import { io } from "socket.io-client";

const socket = io("https://bwp-kotoba.onrender.com", {
//   transports: ["websocket"],
//   upgrade: false,
   withCredentials: true,
});

export default socket;
