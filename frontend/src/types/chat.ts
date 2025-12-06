import { Socket as SocketIOClientSocket } from 'socket.io-client';

export interface ChatSelection {
    id: string;
    name: string;
    isGroup: boolean;
}

export interface User {
    _id: string;
    username: string;
}

export interface Group {
    _id: string;
    groupName: string;
}

// Custom Socket type to include the 'data' property
export interface CustomSocket extends SocketIOClientSocket {
    data: {
        user: {
            username: string;
            _id: string;
        };
    };
}
