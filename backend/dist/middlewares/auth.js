import jwt from "jsonwebtoken";
import { checkUserExistsById } from "../utils/userStuff.js";
export async function verifyJwt(req, res, next) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await checkUserExistsById(decoded.sub);
        if (!user)
            throw new Error("Invalid Access Token");
        req.user = user;
        return next();
    }
    catch (error) {
        console.log(error.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
}
//# sourceMappingURL=auth.js.map