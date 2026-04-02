import { prisma } from "../db.js";
/**
 * Find an existing DM conversation between two users.
 * If none exists, create a new one with both users as participants.
 */
export async function getOrCreateDmConversation(userId1, userId2) {
    // Find conversations where both users are participants
    const existing = await prisma.conversation.findFirst({
        where: {
            type: "dm",
            AND: [
                { participants: { some: { userId: userId1 } } },
                { participants: { some: { userId: userId2 } } },
            ],
        },
        include: { participants: true },
    });
    if (existing)
        return existing;
    // Create a new DM conversation
    return prisma.conversation.create({
        data: {
            type: "dm",
            participants: {
                create: [{ userId: userId1 }, { userId: userId2 }],
            },
        },
        include: { participants: true },
    });
}
export async function getConversationMessages(convId) {
    return prisma.message.findMany({
        where: { convId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: { select: { id: true, name: true } },
        },
    });
}
//# sourceMappingURL=conversationController.js.map