import { useState, useRef, useEffect } from 'react';
import { Phone, Video, MoreVertical, Send, Smile, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import type { User, Message } from '../types/chat';

interface ChatAreaProps {
    currentUser: User | null;
    activeUser: User | null;
    messages: Message[];
    loading: boolean;
    onSendMessage: (text: string) => void;
}

export function ChatArea({ currentUser, activeUser, messages, loading, onSendMessage }: ChatAreaProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue.trim());
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!activeUser) {
        return (
            <div className="chat-area chat-area--empty">
                <div className="empty-chat-state">
                    <div className="empty-chat-icon">💬</div>
                    <h3>Select a conversation</h3>
                    <p>Pick someone from the sidebar to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="avatar" style={{ width: 40, height: 40, marginRight: 12 }}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.name)}`}
                            alt={activeUser.name}
                        />
                    </div>
                    <div className="chat-header-text">
                        <h3>{activeUser.name}</h3>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn"><Phone size={20} /></button>
                    <button className="icon-btn"><Video size={20} /></button>
                    <button className="icon-btn"><MoreVertical size={20} /></button>
                </div>
            </div>

            <div className="messages-container">
                {loading && (
                    <div className="messages-loading">
                        <span className="spinner" />
                        <span>Loading messages…</span>
                    </div>
                )}
                {!loading && messages.length === 0 && (
                    <div className="no-messages">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}
                {messages.map(msg => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                        <div key={msg.id} className={`message-wrapper ${isMe ? 'sent' : 'received'}`}>
                            <div className="message-bubble">{msg.content}</div>
                            <div className="message-time">
                                {format(new Date(msg.createdAt), 'hh:mm a')}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="input-container">
                    <button className="icon-btn" style={{ padding: 4, marginRight: 8 }}>
                        <Paperclip size={20} />
                    </button>
                    <textarea
                        className="message-input"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                    />
                    <button className="icon-btn" style={{ padding: 4, marginRight: 8 }}>
                        <Smile size={20} />
                    </button>
                    <button
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                    >
                        <Send size={18} style={{ marginLeft: -2 }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
