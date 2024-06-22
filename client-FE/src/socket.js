import { io } from "socket.io-client";
import { useEffect, useRef } from "react";

const useSocket = () => {
  const socket = useRef(null);

  useEffect(() => {
    // Initialize the socket connection
    const URL = "ws://localhost:8900";
    socket.current = io(URL, { autoConnect: true });
    socket.current.onAny((event, ...args) => {
      console.log(event, args);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return socket.current;
};

export default useSocket;
