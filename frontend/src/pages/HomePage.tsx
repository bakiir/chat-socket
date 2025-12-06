import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import Chat from '../components/Chat';
import ChatList from '../components/ChatList';
import './HomePageStyle.css';
import type { ChatSelection, User, Group } from '../types/chat';
import { API_BASE_URL } from '../utils/config';


const HomePage = () => {
    const { logout, token } = useAuth();
    const [dms, setDms] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatSelection | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch chats (DMs and groups)
                const chatsResponse = await fetch(`${API_BASE_URL}/api/chats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!chatsResponse.ok) throw new Error('Failed to fetch chats');
                const { dms, groups } = await chatsResponse.json();
                setDms(dms);
                setGroups(groups);

                // Fetch all users
                const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!usersResponse.ok) throw new Error('Failed to fetch users');
                const allUsers = await usersResponse.json();
                setUsers(allUsers);

            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred during initial data fetch.');
                }
            }
        };

        if (token) {
            fetchInitialData();
        }
    }, [token]);

    const handleSelectChat = (chat: ChatSelection) => {
        setSelectedChat(chat);
    };
    
    const handleCreateGroup = async (name: string, memberIds: string[]) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/chats/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, members: memberIds }),
            });
            if (!response.ok) throw new Error('Failed to create group');
            const newGroup = await response.json();
            setGroups(prev => [...prev, newGroup]);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during group creation.');
            }
        }
    };


    return (
        <div className="homepage-container">
            <div className="sidebar">
                <ChatList
                    dms={dms}
                    groups={groups}
                    allUsers={users}
                    onSelectChat={handleSelectChat}
                    onCreateGroup={handleCreateGroup}
                />
                <button onClick={logout} className="logout-button">Logout</button>
            </div>
            <div className="chat-area">
                {selectedChat ? (
                    <Chat chat={selectedChat} />
                ) : (
                    <div className="no-chat-selected">
                        <h2>Select a chat to start messaging</h2>
                    </div>
                )}
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default HomePage;