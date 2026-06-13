import { io } from "socket.io-client";

export const socket = io("http://192.168.1.110:3000", {
  transports: ['polling', 'websocket'],
  autoConnect: false,
});