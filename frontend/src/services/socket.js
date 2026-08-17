/**
 * Singleton Socket.io client
 * One instance shared across the entire app.
 * Import and use `getSocket()` everywhere.
 */
import { io } from "socket.io-client";

const SOCKET_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1")
    .replace("/api/v1", "");

let _socket = null;

/**
 * Returns the singleton socket instance.
 * Creates it on first call using the provided token.
 */
export const getSocket = (token) => {
  // If already connected, return existing
  if (_socket && _socket.connected) return _socket;

  // If exists but disconnected, reconnect
  if (_socket) {
    if (token) _socket.auth = { token };
    _socket.connect();
    return _socket;
  }

  // First time — create the socket
  _socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return _socket;
};

/**
 * Disconnect and destroy the socket (on logout)
 */
export const destroySocket = () => {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
};

export default getSocket;
