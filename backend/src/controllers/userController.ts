import {prisma} from "../db.js";

export async function registerUser(name: string) {
    return prisma.user.upsert({
        where: { name },
        update: {},
        create: { name },
    });
}

export async function getAllUsers() {
    return prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, createdAt: true },
    });
}
