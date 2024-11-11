import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const serverURL = import.meta.env.VITE_SERVER_URL;

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(serverURL);

        newSocket.on('connect', () => {
            setConnected(true);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return { socket, connected };
};