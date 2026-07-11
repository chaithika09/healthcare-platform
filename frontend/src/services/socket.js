import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

let socket = null;

export const connectSocket = () => {
  const token = useAuthStore.getState().token;
  if (!token || socket?.connected) return socket;

  socket = io(process.env.REACT_APP_API_URL?.replace("/api/v1", "") || "http://localhost:5000", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
  socket.on("connect_error", (err) => console.error("Socket error:", err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getSocket = () => socket;

export default { connectSocket, disconnectSocket, getSocket };
