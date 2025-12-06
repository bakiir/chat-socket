import { useState } from 'react';
import type { User, Group, ChatSelection } from '../types/chat';

interface ChatListProps {
    dms: User[];
    groups: Group[];
    allUsers: User[];
    onSelectChat: (selection: ChatSelection) => void;
    onCreateGroup: (name: string, memberIds: string[]) => void;
}


const CreateGroupModal = ({ users, onCreate, onCancel }: { users: User[], onCreate: (name: string, members: string[]) => void, onCancel: () => void }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const handleUserToggle = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        if (groupName && selectedUsers.length >= 2) {
            onCreate(groupName, selectedUsers);
        } else {
            alert('Group name is required and you must select at least 2 other members.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Create New Group</h2>
                <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                />
                <h3>Select Members (at least 2)</h3>
                <div className="user-list">
                    {users.map(user => (
                        <div key={user._id}>
                            <input
                                type="checkbox"
                                id={`user-${user._id}`}
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleUserToggle(user._id)}
                            />
                            <label htmlFor={`user-${user._id}`}>{user.username}</label>
                        </div>
                    ))}
                </div>
                <button onClick={handleSubmit}>Create</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};


const ChatList = ({ dms, groups, allUsers, onSelectChat, onCreateGroup }: ChatListProps) => {
    const [showModal, setShowModal] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(false);

    return (
        <div className="chat-list">
            <h2>Direct Messages</h2>
            {dms.map(dm => (
                <div key={dm._id} className="chat-list-item" onClick={() => onSelectChat({ id: dm._id, name: dm.username, isGroup: false })}>
                    {dm.username}
                </div>
            ))}

            <h2>Groups</h2>
            {groups.map(group => (
                <div key={group._id} className="chat-list-item" onClick={() => onSelectChat({ id: group._id, name: group.name, isGroup: true })}>
                    {group.name}
                </div>
            ))}
            <button onClick={() => setShowModal(true)}>Create Group</button>

            <h2 onClick={() => setShowAllUsers(!showAllUsers)} style={{cursor: 'pointer'}}>
                Start New Chat {showAllUsers ? '▲' : '▼'}
            </h2>
            {showAllUsers && allUsers.map(user => (
                 <div key={user._id} className="chat-list-item" onClick={() => onSelectChat({ id: user._id, name: user.username, isGroup: false })}>
                    {user.username}
                </div>
            ))}

            {showModal && (
                <CreateGroupModal
                    users={allUsers}
                    onCreate={(name, members) => {
                        onCreateGroup(name, members);
                        setShowModal(false);
                    }}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default ChatList;
