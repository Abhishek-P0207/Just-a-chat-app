export interface User {
    id: string;
    name: string;
    createdAt: string;
}

export interface Message {
    id: string;
    convId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string };
}

export interface Conversation {
    id: string;
    type: string;
}
