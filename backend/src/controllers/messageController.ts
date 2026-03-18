import {prisma} from "../db.js";

export async function saveMessage(convId: string, senderId: string, content: string) {
    return prisma.message.create({
        data: { convId, senderId, content },
        include: {
            sender: { select: { id: true, name: true } },
        },
    });
}
