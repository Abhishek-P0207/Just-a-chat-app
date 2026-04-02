import { prisma } from "../db.js";
export async function saveMessage(convId, senderId, content) {
    return prisma.message.create({
        data: { convId, senderId, content },
        include: {
            sender: { select: { id: true, name: true } },
        },
    });
}
//# sourceMappingURL=messageController.js.map