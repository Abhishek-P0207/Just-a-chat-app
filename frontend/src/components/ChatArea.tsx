import { useState, useRef, useEffect } from 'react';
import { Phone, Video, MoreVertical, Send, Smile, Paperclip, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { User, Message, Group } from '../types/chat';
import GroupCall from './call';

interface ChatAreaProps {
    currentUser: User | null;
    activeUser: User | null;
    activeGroup: Group | null;
    activeConvId: string | null;
    messages: Message[];
    loading: boolean;
    onSendMessage: (text: string) => void;
    showCall: boolean;
    setShowCall: (show: boolean) => void;
    callType: 'audio' | 'video';
    onStartCall: (roomName: string) => void;
    onStartVideoCall: (roomName: string) => void;
}

export function ChatArea({ currentUser, activeUser, activeGroup, activeConvId, messages, loading, onSendMessage, showCall, setShowCall, callType, onStartCall, onStartVideoCall }: ChatAreaProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Clear input and call state when conversation changes
    useEffect(() => {
        setInputValue('');
        setShowCall(false);
    }, [activeUser?.id, activeGroup?.id, setShowCall]);

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

    const isActive = activeUser !== null || activeGroup !== null;

    if (!isActive) {
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

    // Determine title and avatar for the header
    const headerName = activeGroup ? activeGroup.name : activeUser!.name;
    const headerAvatarSeed = activeGroup
        ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(activeGroup.name)}`
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser!.name)}`;
    const headerSubtitle = activeGroup
        ? `${activeGroup.memberIds.length} members`
        : null;

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="avatar" style={{ width: 40, height: 40, marginRight: 12 }}>
                        <img src={headerAvatarSeed} alt={headerName} />
                        {activeGroup && (
                            <div className="status-indicator" style={{ background: 'var(--accent, #6c63ff)' }}>
                                <Users size={8} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                            </div>
                        )}
                    </div>
                    <div className="chat-header-text">
                        <h3>{headerName}</h3>
                        {headerSubtitle && <span style={{ fontSize: '12px', opacity: 0.65 }}>{headerSubtitle}</span>}
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className={`icon-btn ${showCall ? 'active' : ''}`}
                        onClick={() => {
                            if (!showCall) {
                                onStartCall(activeConvId ? `conv-${activeConvId}` : 'default-room');
                            } else {
                                setShowCall(false);
                            }
                        }}
                        style={showCall ? { color: 'var(--accent, #6c63ff)' } : {}}
                    >
                        <Phone size={20} />
                    </button>
                    <button className="icon-btn" onClick={() => {
                        if (!showCall) {
                            onStartVideoCall(activeConvId ? `conv-${activeConvId}` : 'default-room');
                        } else {
                            setShowCall(false);
                        }
                    }}
                        style={showCall && callType === 'video' ? { color: 'var(--accent, #6c63ff)' } : {}}
                    ><Video size={20} /></button>
                    <button className="icon-btn"><MoreVertical size={20} /></button>
                </div>
            </div>

            {showCall ? (
                <div className="call-container" style={{ flex: 1, backgroundColor: '#1e1e1e', borderRadius: '8px', margin: '10px', overflow: 'hidden' }}>
                    <GroupCall
                        roomName={activeConvId ? `conv-${activeConvId}` : 'default-room'}
                        username={currentUser?.name}
                        onLeave={() => setShowCall(false)}
                        callType={callType}
                    />
                </div>
            ) : (
                <>
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
                                    {activeGroup && !isMe && (
                                        <div className="message-sender-name">{msg.sender?.name}</div>
                                    )}
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
                                placeholder={activeGroup ? `Message ${headerName}…` : "Type a message..."}
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
                </>
            )}
        </div>
    );
}
