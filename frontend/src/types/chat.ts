export interface User {
    id: string;
    name: string;
    password: string;
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

export interface Group {
    id: string;
    name: string;
    memberIds: string[];
    createdAt: string;
}
