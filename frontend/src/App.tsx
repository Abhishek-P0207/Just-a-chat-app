import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { UsernameModal } from './components/UsernameModal';
import type { User, Message } from './types/chat';
import { getUsers, getDmConversationId, getMessages } from './api';
import { io, Socket } from 'socket.io-client';

function App() {
  const socketRef = useRef<Socket | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Connect socket once on mount
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    const handler = async (ids: string[]) => {
      setOnlineUserIds(new Set(ids));
      if (currentUser) {
        try {
          const allUsers = await getUsers();
          setUsers(allUsers.filter(u => u.id !== currentUser.id));
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      }
    };

    socketRef.current.on('onlineUsers', handler);
    return () => {
      socketRef.current?.off('onlineUsers', handler);
    };
  }, [currentUser]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handler = (msg: Message) => {
      // Only append if this message belongs to the active conversation
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev; // deduplicate
        if (msg.convId === activeConvId) {
          return [...prev, msg];
        }
        return prev;
      });
    };

    socketRef.current.on('chat', handler);
    return () => {
      socketRef.current?.off('chat', handler);
    };
  }, [activeConvId]);

  // After login: register socket, fetch user list
  const handleRegistered = useCallback(async (user: User) => {
    setCurrentUser(user);
    socketRef.current?.emit('register', user.id);

    const allUsers = await getUsers();
    // Exclude self from sidebar
    setUsers(allUsers.filter(u => u.id !== user.id));
  }, []);

  // Select a contact → get/create DM conversation and load history
  const handleSelectUser = useCallback(async (user: User) => {
    if (!currentUser) return;
    setActiveUser(user);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const convId = await getDmConversationId(currentUser.id, user.id);
      setActiveConvId(convId);
      const history = await getMessages(convId);
      setMessages(history);
    } catch (err) {
      console.error('Failed to open conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUser]);

  const handleSendMessage = useCallback((text: string) => {
    if (!currentUser || !activeUser || !activeConvId) return;
    socketRef.current?.emit('chat', {
      convId: activeConvId,
      content: text,
      senderId: currentUser.id,
      toUserId: activeUser.id,
    });
    // Optimistic message will be replaced by the echo from server (deduplicated by id)
  }, [currentUser, activeUser, activeConvId]);

  return (
    <>
      {!currentUser && <UsernameModal onRegistered={handleRegistered} />}
      <div className="app-container glass-panel">
        <Sidebar
          users={users}
          activeUserId={activeUser?.id ?? null}
          onlineUserIds={onlineUserIds}
          onSelectUser={handleSelectUser}
        />
        <ChatArea
          currentUser={currentUser}
          activeUser={activeUser}
          messages={messages}
          loading={loadingMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </>
  );
}

export default App;
