import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/config';
import type { CustomSocket } from '../types/chat';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

interface DecodedToken {
    id: string;
    username: string;
    iat: number;
    exp: number;
}

interface AuthContextType {
    token: string | null;
    socket: CustomSocket | null;
    user: { userId: string; username: string } | null; // Add user to context type
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
    const [user, setUser] = useState<{ userId: string; username: string } | null>(null); // Add user state

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode<DecodedToken>(token);
                setUser({ userId: decodedToken.id, username: decodedToken.username }); // Set user state

                const newSocket: CustomSocket = io(API_BASE_URL, {
                    auth: { token }
                }) as CustomSocket;
                setSocket(newSocket);

                return () => {
                    newSocket.disconnect();
                };
            } catch (error) {
                console.error("Error decoding token:", error);
                // Handle invalid token, e.g., log out the user
                logout();
            }
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setUser(null); // Clear user state when token is null
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null); // Clear user state on logout
    };

    return (
        <AuthContext.Provider value={{ token, socket, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
