import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CONTACTS, INITIAL_MESSAGES } from './data/mockData';
import type { Message } from './types/chat';

function App() {
  const [activeContactId, setActiveContactId] = useState<number | string>(CONTACTS[0].id);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const activeContact = CONTACTS.find(c => c.id === activeContactId) || CONTACTS[0];

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      senderId: 'me',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate reply
    setTimeout(() => {
      const replyMessage: Message = {
        id: messages.length + 2,
        senderId: activeContact.id,
        text: 'That looks amazing! Keep up the good work. 🚀',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1500);
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
