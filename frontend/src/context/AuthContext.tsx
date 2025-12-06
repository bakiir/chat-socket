import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/config';
import type { CustomSocket } from '../types/chat';

interface AuthContextType {
    token: string | null;
    socket: CustomSocket | null;
    login: (newToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [socket, setSocket] = useState<CustomSocket | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        if (token) {
            const newSocket: CustomSocket = io(API_BASE_URL, {
                auth: { token }
            }) as CustomSocket; // Cast to CustomSocket
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, socket, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
