export declare function saveMessage(convId: string, senderId: string, content: string): Promise<{
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
}>;
//# sourceMappingURL=messageController.d.ts.map