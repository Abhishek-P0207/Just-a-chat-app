import {prisma} from "../db.js";

export async function checkUsernameIsUnique(name: string){
    const user = await prisma.user.findFirst({
        where: {
            name: name
        },
    })
    if(!user) return true;
    return false;
}