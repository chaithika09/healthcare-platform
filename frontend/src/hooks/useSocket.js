import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import { useAuthStore } from "../store/authStore";

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = connectSocket();
    }
    return () => {
      if (!isAuthenticated) disconnectSocket();
    };
  }, [isAuthenticated]);

  return socketRef.current || getSocket();
};

export default useSocket;
