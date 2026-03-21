import { useState } from 'react';
import { Search, MoreVertical, MessageSquarePlus, UserPlus } from 'lucide-react';
import type { User, Group } from '../types/chat';
import { CreateGroup } from './CreateGroup';

interface SidebarProps {
    users: User[];
    activeUserId: string | null;
    onlineUserIds: Set<string>;
    onSelectUser: (user: User) => void;
    onGroupRegister: (group: Group) => void;
    groups: Group[];
    activeGroupId: string | null;
    onSelectGroup: (group: Group) => void;
    currentUser: User | null;
}

export function Sidebar({
    users,
    activeUserId,
    onlineUserIds,
    onSelectUser,
    onGroupRegister,
    groups,
    activeGroupId,
    onSelectGroup,
    currentUser,
}: SidebarProps) {
    const [showCreateGroup, setShowCreateGroup] = useState(false);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Messages</h2>
                <button className="icon-btn">
                    <MoreVertical size={20} />
                </button>
            </div>

            <div className="search-container">
                <div className="search-input-wrapper">
                    <Search />
                    <input type="text" className="search-input" placeholder="Search people..." />
                </div>
            </div>

            <div className="contact-list">
                {/* Direct messages */}
                {users.length === 0 && groups.length === 0 && (
                    <div className="empty-state">
                        <MessageSquarePlus size={32} className="empty-state-icon" />
                        <p>No other users yet.</p>
                        <span>Ask a friend to join!</span>
                    </div>
                )}

                {users.map(user => {
                    const isOnline = onlineUserIds.has(user.id);
                    return (
                        <div
                            key={user.id}
                            className={`contact-item ${activeUserId === user.id ? 'active' : ''}`}
                            onClick={() => onSelectUser(user)}
                        >
                            <div className="avatar">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                                    alt={user.name}
                                />
                                <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`} />
                            </div>
                            <div className="contact-info">
                                <div className="contact-name-row">
                                    <span className="contact-name">{user.name}</span>
                                    <span className={`online-badge ${isOnline ? 'online-badge--on' : ''}`}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <div className="contact-last-message">Click to start chatting</div>
                            </div>
                        </div>
                    );
                })}

                {/* Groups section */}
                {groups.length > 0 && (
                    <>
                        <div className="contact-section-label">Groups</div>
                        {groups.map(group => (
                            <div
                                key={group.id}
                                className={`contact-item ${activeGroupId === group.id ? 'active' : ''}`}
                                onClick={() => onSelectGroup(group)}
                            >
                                <div className="avatar">
                                    <img
                                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(group.name)}`}
                                        alt={group.name}
                                    />
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name-row">
                                        <span className="contact-name">{group.name}</span>
                                    </div>
                                    <div className="contact-last-message">
                                        {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                <button
                    className="fab-new-group"
                    onClick={() => setShowCreateGroup(true)}
                    aria-label="Create new group"
                >
                    <UserPlus size={24} />
                </button>
            </div>

            {showCreateGroup && (
                <CreateGroup
                    users={users}
                    currentUser={currentUser}
                    onGroupRegister={(group) => {
                        onGroupRegister(group);
                        setShowCreateGroup(false);
                    }}
                    onClose={() => setShowCreateGroup(false)}
                />
            )}
        </div>
    );
}
