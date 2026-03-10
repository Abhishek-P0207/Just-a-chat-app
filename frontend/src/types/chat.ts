export interface Contact {
    id: number | string;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
    lastMessage: string;
    time: string;
}

export interface Message {
    id: number | string;
    senderId: number | string;
    text: string;
    timestamp: Date;
}
