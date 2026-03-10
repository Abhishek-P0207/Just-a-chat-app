import { Search, MoreVertical } from 'lucide-react';
import type { Contact } from '../types/chat';

interface SidebarProps {
    contacts: Contact[];
    activeContactId: number | string;
    onSelectContact: (id: number | string) => void;
}

export function Sidebar({ contacts, activeContactId, onSelectContact }: SidebarProps) {
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
                    <input type="text" className="search-input" placeholder="Search chats..." />
                </div>
            </div>

            <div className="contact-list">
                {contacts.map(contact => (
                    <div
                        key={contact.id}
                        className={`contact-item ${activeContactId === contact.id ? 'active' : ''}`}
                        onClick={() => onSelectContact(contact.id)}
                    >
                        <div className="avatar">
                            <img src={contact.avatar} alt={contact.name} />
                            <div className={`status-indicator status-${contact.status}`}></div>
                        </div>
                        <div className="contact-info">
                            <div className="contact-name-row">
                                <span className="contact-name">{contact.name}</span>
                                <span className="contact-time">{contact.time}</span>
                            </div>
                            <div className="contact-last-message">{contact.lastMessage}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
