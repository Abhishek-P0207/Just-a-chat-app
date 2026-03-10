import type { Contact, Message } from '../types/chat';

export const CONTACTS: Contact[] = [
    { id: 1, name: 'Alice Cooper', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', status: 'online', lastMessage: 'See you tomorrow!', time: '10:42 AM' },
    { id: 2, name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', status: 'offline', lastMessage: 'Can you send the files?', time: 'Yesterday' },
    { id: 3, name: 'Charlie Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', status: 'online', lastMessage: 'Thanks man.', time: 'Tuesday' },
    { id: 4, name: 'Diana Prince', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', status: 'online', lastMessage: 'I will check it out.', time: 'Monday' },
    { id: 5, name: 'Evan Wright', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan', status: 'offline', lastMessage: 'Got it.', time: 'Sunday' },
];

export const INITIAL_MESSAGES: Message[] = [
    { id: 1, senderId: 1, text: 'Hey there! How is the new project going?', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: 2, senderId: 'me', text: 'It\'s going great! Just setting up the frontend now.', timestamp: new Date(Date.now() - 3600000 * 1.5) },
    { id: 3, senderId: 1, text: 'Awesome. Let me know if you need any help with the design.', timestamp: new Date(Date.now() - 3600000 * 1) },
    { id: 4, senderId: 'me', text: 'Will do. I am trying out a glassmorphism theme.', timestamp: new Date(Date.now() - 1800000) },
    { id: 5, senderId: 1, text: 'Sounds fancy! Can\'t wait to see it.', timestamp: new Date(Date.now() - 300000) },
];
