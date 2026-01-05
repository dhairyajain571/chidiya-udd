import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Auto-detect URL: Prod (Same Origin) vs Dev (Port 3001)
    const url = import.meta.env.PROD
      ? window.location.origin
      : `http://${window.location.hostname}:3001`;

    const newSocket = io(url);

    newSocket.on('connect', () => console.log('✅ Socket Connected to:', url, newSocket.id));
    newSocket.on('connect_error', (err) => console.error('❌ Socket Connection Error:', err.message));
    newSocket.on('disconnect', (reason) => console.warn('⚠️ Socket Disconnected:', reason));

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
