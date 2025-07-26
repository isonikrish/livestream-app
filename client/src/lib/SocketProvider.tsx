import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({children}: SocketProviderProps) =>{

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        let sock: Socket;
        const setupSocket = () => {
            sock = io("http://localhost:4000");
            setSocket(sock);
        }
        
        setupSocket();

        return () => {
            if (sock) sock.disconnect();
        };
    }, [])
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}