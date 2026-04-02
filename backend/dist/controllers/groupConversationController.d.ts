export declare function createGroupConversation(name: string, members: string[]): Promise<{
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
export declare function getAllGroups(userId: string): Promise<({
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
})[]>;
//# sourceMappingURL=groupConversationController.d.ts.map