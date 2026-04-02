import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { UsernameModal } from './components/UsernameModal';
import type { User, Message, Group } from './types/chat';
import { getUsers, getDmConversationId, getMessages, getGroups } from './api';
import { io, Socket } from 'socket.io-client';
import { IncomingCallModal } from './components/IncomingCallModal';

function App() {
  const socketRef = useRef<Socket | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // DM state
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Group state
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Call state
  const [showCall, setShowCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [incomingCall, setIncomingCall] = useState<{ roomName: string, callerName: string, callerId: string, convId?: string, isGroup: boolean, callType: 'audio' | 'video' } | null>(null);

  // Connect socket once on mount
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BASE_SERVER_URL);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Online users
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
    return () => { socketRef.current?.off('onlineUsers', handler); };
  }, [currentUser]);

  // joinGroup event: server notifies that a group was created and we're a member
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (group: Group) => {
      setGroups(prev => {
        if (prev.some(g => g.id === group.id)) return prev;
        return [group, ...prev];
      });
    };
    socketRef.current.on('joinGroup', handler);
    return () => { socketRef.current?.off('joinGroup', handler); };
  }, []);

  // Incoming call listener
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (data: { roomName: string, callerName: string, callerId: string, convId?: string, isGroup: boolean, callType: 'audio' | 'video' }) => {
      setIncomingCall(data);
    };
    socketRef.current.on('incoming-call', handler);
    return () => { socketRef.current?.off('incoming-call', handler); };
  }, []);

  // Incoming DM messages
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        if (msg.convId === activeConvId) return [...prev, msg];
        return prev;
      });
    };
    socketRef.current.on('chat', handler);
    return () => { socketRef.current?.off('chat', handler); };
  }, [activeConvId]);

  // Incoming group messages
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        if (msg.convId === activeConvId) return [...prev, msg];
        return prev;
      });
    };
    socketRef.current.on('group-chat', handler);
    return () => { socketRef.current?.off('group-chat', handler); };
  }, [activeConvId]);

  // After login: register socket, fetch users and groups
  const handleRegistered = useCallback(async (user: User) => {
    setCurrentUser(user);
    socketRef.current?.emit('register', user.id);

    try {
      const [allUsers, userGroups] = await Promise.all([
        getUsers(),
        getGroups(user.id),
      ]);
      setUsers(allUsers.filter(u => u.id !== user.id));
      setGroups(userGroups);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  // Called by Sidebar after a group is created via <CreateGroup>
  const handleGroupRegistered = useCallback((group: Group) => {
    // Join the socket room for this group
    socketRef.current?.emit('createGroup', {
      groupId: group.id,
      name: group.name,
      members: group.memberIds,
    });
    setGroups(prev => {
      if (prev.some(g => g.id === group.id)) return prev;
      return [group, ...prev];
    });
  }, []);

  // Select a DM contact
  const handleSelectUser = useCallback(async (user: User) => {
    if (!currentUser) return;
    setActiveUser(user);
    setActiveGroup(null);
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

  // Select a group
  const handleSelectGroup = useCallback(async (group: Group) => {
    setActiveGroup(group);
    setActiveUser(null);
    setMessages([]);
    setLoadingMessages(true);
    try {
      setActiveConvId(group.id);
      const history = await getMessages(group.id);
      setMessages(history);
    } catch (err) {
      console.error('Failed to open group conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Send a DM
  const handleSendMessage = useCallback((text: string) => {
    if (!currentUser || !activeUser || !activeConvId) return;
    socketRef.current?.emit('chat', {
      convId: activeConvId,
      content: text,
      senderId: currentUser.id,
      toUserId: activeUser.id,
    });
  }, [currentUser, activeUser, activeConvId]);

  // Send a group message
  const handleSendGroupMessage = useCallback((text: string) => {
    if (!currentUser || !activeGroup || !activeConvId) return;
    socketRef.current?.emit('group-chat', {
      convId: activeConvId,
      content: text,
      senderId: currentUser.id,
    });
  }, [currentUser, activeGroup, activeConvId]);

  // Start an audio call
  const handleStartCall = useCallback((roomName: string) => {
    if (!currentUser) return;
    const payload = {
      roomName, callerName: currentUser.name, callerId: currentUser.id, callType: 'audio' as const,
      ...(activeGroup ? { convId: activeGroup.id, memberIds: activeGroup.memberIds } : { toUserId: activeUser?.id, convId: activeConvId ?? undefined }),
    };
    socketRef.current?.emit('call-invite', payload);
    setCallType('audio');
    setShowCall(true);
  }, [currentUser, activeGroup, activeUser, activeConvId]);

  // Start a video call
  const handleStartVideoCall = useCallback((roomName: string) => {
    if (!currentUser) return;
    const payload = {
      roomName, callerName: currentUser.name, callerId: currentUser.id, callType: 'video' as const,
      ...(activeGroup ? { convId: activeGroup.id, memberIds: activeGroup.memberIds } : { toUserId: activeUser?.id, convId: activeConvId ?? undefined }),
    };
    socketRef.current?.emit('call-invite', payload);
    setCallType('video');
    setShowCall(true);
  }, [currentUser, activeGroup, activeUser, activeConvId]);

  // Accept incoming call
  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall || !currentUser) return;

    if (incomingCall.isGroup && incomingCall.convId) {
      const group = groups.find(g => g.id === incomingCall.convId);
      if (group) await handleSelectGroup(group);
    } else {
      const user = users.find(u => u.id === incomingCall.callerId);
      if (user) await handleSelectUser(user);
    }

    setCallType(incomingCall.callType);
    setShowCall(true);
    setIncomingCall(null);
  }, [incomingCall, currentUser, groups, users, handleSelectGroup, handleSelectUser]);

  return (
    <>
      {!currentUser && <UsernameModal onRegistered={handleRegistered} />}
      <div className="app-container glass-panel">
        <Sidebar
          users={users}
          activeUserId={activeUser?.id ?? null}
          onlineUserIds={onlineUserIds}
          onSelectUser={handleSelectUser}
          onGroupRegister={handleGroupRegistered}
          groups={groups}
          activeGroupId={activeGroup?.id ?? null}
          onSelectGroup={handleSelectGroup}
          currentUser={currentUser}
        />
        <ChatArea
          currentUser={currentUser}
          activeUser={activeUser}
          activeGroup={activeGroup}
          activeConvId={activeConvId}
          messages={messages}
          loading={loadingMessages}
          onSendMessage={activeGroup ? handleSendGroupMessage : handleSendMessage}
          showCall={showCall}
          setShowCall={setShowCall}
          callType={callType}
          onStartCall={handleStartCall}
          onStartVideoCall={handleStartVideoCall}
        />
      </div>

      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          isGroup={incomingCall.isGroup}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onDecline={() => setIncomingCall(null)}
        />
      )}
    </>
  );
}

export default App;
