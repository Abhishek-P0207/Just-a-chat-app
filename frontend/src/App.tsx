import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CONTACTS, INITIAL_MESSAGES } from './data/mockData';
import type { Message } from './types/chat';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef } from 'react';

function App() {

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      console.log("Connected with id", socketRef.current?.id);
    })

    socketRef.current.on("disconnect", () => {
      console.log(`Socket disconencted`);
    })

    return (() => {
      socketRef.current?.disconnect();
    })
  }, [])

  const [activeContactId, setActiveContactId] = useState<number | string>(CONTACTS[0].id);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const activeContact = CONTACTS.find(c => c.id === activeContactId) || CONTACTS[0];


  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("chat", (reply: string) => {
      const replyMessage: Message = {
        id: uuidv4(),
        senderId: 'friend',
        text: reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, replyMessage]);
    })
  }, [])

  const handleSendMessage = (text: string) => {
    socketRef.current?.emit("chat", text);
    const newMessage: Message = {
      id: uuidv4(),
      senderId: 'me',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="app-container glass-panel">
      <Sidebar
        contacts={CONTACTS}
        activeContactId={activeContactId}
        onSelectContact={setActiveContactId}
      />
      <ChatArea
        activeContact={activeContact}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default App;
