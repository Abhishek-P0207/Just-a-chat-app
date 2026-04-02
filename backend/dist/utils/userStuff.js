import { prisma } from "../db.js";
export async function checkUsernameIsUnique(name) {
    const user = await prisma.user.findFirst({
        where: {
            name: name
        },
    });
    if (!user)
        return true;
    return false;
}
export async function checkUserExistsById(id) {
    const user = await prisma.user.findUnique({
        where: { id }
    });
    return user;
}
//# sourceMappingURL=userStuff.js.map