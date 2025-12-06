import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ChatSelection, CustomSocket } from '../types/chat';
import { API_BASE_URL } from '../utils/config';
import './Chat.css';

interface IMessage {
    _id: string;
    sender: string;
    content: string;
    timestamp: string;
    isGroup: boolean;
    groupName?: string;
    receiver?: string;
}

interface ChatProps {
    chat: ChatSelection;
}

const Chat = ({ chat }: ChatProps) => {
    const { token, socket } = useAuth();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const roomName = chat.isGroup ? chat.name : [(socket as CustomSocket)?.data.user.username, chat.name].sort().join('_');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token || !chat) return;
            
            const endpoint = chat.isGroup
                ? `${API_BASE_URL}/api/chats/history/group/${chat.id}`
                : `${API_BASE_URL}/api/chats/history/dm/${chat.name}`;

            try {
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch message history');
                const history = await response.json();
                setMessages(history);
            } catch (error) {
                console.error(error);
                setMessages([]); // Clear messages on error
            }
        };

        fetchHistory();
    }, [chat, token]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_room', roomName);

        const handleReceiveMessage = (msg: IMessage) => {
            // Only add the message if it belongs to the currently active chat
            const messageIsInCurrentDm = !chat.isGroup && !msg.isGroup && ((msg.sender === chat.name && msg.receiver === (socket as CustomSocket).data.user.username) || (msg.sender === (socket as CustomSocket).data.user.username && msg.receiver === chat.name));
            const messageIsInCurrentGroup = chat.isGroup && msg.isGroup && msg.groupName === chat.name;

            if (messageIsInCurrentDm || messageIsInCurrentGroup) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, chat, roomName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!socket || !input.trim()) return;

        const messagePayload = {
            content: input,
            isGroup: chat.isGroup,
            groupName: chat.isGroup ? chat.name : undefined,
            receiver: !chat.isGroup ? chat.name : undefined,
        };

        socket.emit('send_message', messagePayload);
        setInput('');
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{chat.name}</h2>
            </div>
            <div className="messages-list">
                {messages.map((msg) => (
                    <div key={msg._id} className={`message ${msg.sender === (socket as CustomSocket)?.data.user.username ? 'sent' : 'received'}`}>
                        <div className="message-sender">{msg.sender}</div>
                        <div className="message-content">{msg.content}</div>
                        <div className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="message-input-area">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;