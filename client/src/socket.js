import { io } from "socket.io-client";

const socket = io({
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
