import { Search, MoreVertical, MessageSquarePlus } from 'lucide-react';
import type { User } from '../types/chat';

interface SidebarProps {
    users: User[];
    activeUserId: string | null;
    onlineUserIds: Set<string>;
    onSelectUser: (user: User) => void;
}

export function Sidebar({ users, activeUserId, onlineUserIds, onSelectUser }: SidebarProps) {
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
                {users.length === 0 && (
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
            </div>
        </div>
    );
}
