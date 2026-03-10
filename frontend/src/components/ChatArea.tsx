import { useState, useRef, useEffect } from 'react';
import { Phone, Video, MoreVertical, Send, Smile, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import type { Contact, Message } from '../types/chat';

interface ChatAreaProps {
    activeContact: Contact;
    messages: Message[];
    onSendMessage: (text: string) => void;
}

export function ChatArea({ activeContact, messages, onSendMessage }: ChatAreaProps) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
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

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="avatar" style={{ width: 40, height: 40, marginRight: 12 }}>
                        <img src={activeContact.avatar} alt={activeContact.name} />
                        <div className={`status-indicator status-${activeContact.status}`}></div>
                    </div>
                    <div className="chat-header-text">
                        <h3>{activeContact.name}</h3>
                        <p>{activeContact.status === 'online' ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn"><Phone size={20} /></button>
                    <button className="icon-btn"><Video size={20} /></button>
                    <button className="icon-btn"><MoreVertical size={20} /></button>
                </div>
            </div>

            <div className="messages-container">
                {messages.map(msg => {
                    const isMe = msg.senderId === 'me';
                    return (
                        <div key={msg.id} className={`message-wrapper ${isMe ? 'sent' : 'received'}`}>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                            <div className="message-time">
                                {format(msg.timestamp, 'hh:mm a')}
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
