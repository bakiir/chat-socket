import { io, Socket } from "socket.io-client";

let socket: Socket<any, any> | null = null;

export const connectSocket = (token: string) => {
    if (!socket) {
        socket = io("http://localhost:3001", {
            auth: { token },
        });

        socket.on("connect", () => {
            console.log("Connected to socket", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from socket");
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) throw new Error("Socket not initialized");
    return socket;
};
