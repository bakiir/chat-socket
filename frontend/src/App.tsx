import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

function App() {
    const { token } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/login"
                element={token ? <Navigate to="/" /> : <Login />}
            />
            <Route
                path="/register"
                element={token ? <Navigate to="/" /> : <Register />}
            />
        </Routes>
    );
}

export default App;