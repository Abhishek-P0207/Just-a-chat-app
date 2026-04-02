/**
 * Find an existing DM conversation between two users.
 * If none exists, create a new one with both users as participants.
 */
export declare function getOrCreateDmConversation(userId1: string, userId2: string): Promise<{
    participants: {
        id: string;
        userId: string;
        convId: string;
    }[];
} & {
    id: string;
    name: string | null;
    createdAt: Date;
    type: string;
}>;
export declare function getConversationMessages(convId: string): Promise<({
    sender: {
        id: string;
        name: string;
    };
} & {
    id: string;
    createdAt: Date;
    convId: string;
    content: string;
    senderId: string;
})[]>;
//# sourceMappingURL=conversationController.d.ts.map