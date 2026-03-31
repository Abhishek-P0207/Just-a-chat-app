import {prisma} from "../db.js";
import bcrypt from 'bcrypt';

export async function registerUser(name: string, hash: string) {
    return prisma.user.upsert({
        where: { name },
        update: {},
        create: { name, hash },
    });
}

export async function getAllUsers() {
    return prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, createdAt: true },
    });
}

export async function checkUser(name: string, password: string){
    const user = await prisma.user.findFirst({
        where: {
            name: name
        },
        select: { id: true, name: true, hash: true}
    })
    if(!user) return;
    const check = await bcrypt.compare(password, user.hash);
    if(!check) return;
    const { hash, ...withoutHash} = user;
    return withoutHash;
}
