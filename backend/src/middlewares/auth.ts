import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { checkUserExistsById } from "../utils/userStuff.js";


export async function verifyJwt(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        const user = await checkUserExistsById(decoded.sub as string)
        if (!user) throw new Error("Invalid Access Token");
        (req as any).user = user;

        return next();
    } catch (error: any) {
        console.log(error.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
}