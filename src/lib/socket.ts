import { io } from "socket.io-client";

export const socket = io("http://192.168.0.5:3000", {
  transports: ['polling', 'websocket'],
  autoConnect: false,
});