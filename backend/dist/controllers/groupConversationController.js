import { prisma } from "../db.js";
export async function createGroupConversation(name, members) {
    return prisma.conversation.create({
        data: {
            type: "group",
            name,
            participants: {
                createMany: {
                    data: members.map((id) => ({ userId: id })),
                },
            },
        },
        include: { participants: true },
    });
}
export async function getAllGroups(userId) {
    return prisma.conversation.findMany({
        where: {
            type: "group",
            participants: {
                some: { userId },
            },
        },
        include: { participants: true },
        orderBy: { createdAt: "desc" },
    });
}
//# sourceMappingURL=groupConversationController.js.map