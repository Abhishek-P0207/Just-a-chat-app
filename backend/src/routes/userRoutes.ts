import { Router, type IRouter } from "express";
import { registerUser, getAllUsers, checkUser } from "../controllers/userController.js";
import { checkUsernameIsUnique } from "../utils/userStuff.js";
import json from 'jsonwebtoken';


const router: IRouter = Router();

// POST /api/users/register — register or retrieve a user by name
router.post("/register", async (req, res) => {
    const { name, password } = req.body as { name?: string, password: string };
    if (!name || name.trim().length < 2) {
        res.status(400).json({ error: "Name must be at least 2 characters." });
        return;
    }

    const user = await registerUser(name.trim(), password);
    res.json(user);
});

router.post("/signup", async (req, res) => {
    const { name, password } = req.body as { name?: string, password: string };
    if (!name || name.trim().length < 2 || !password || password.trim().length < 3) {
        res.status(400).json({ error: "Credentails are wrong." });
        return;
    }

    // cehck if username is unique
    const isUnique = await checkUsernameIsUnique(name.trim());
    if (!isUnique) {
        res.status(409).json({ error: "Try another Username" });  // HTTP 409 -> conflict
        return;
    }
    const user = await registerUser(name.trim(), password);

    return res.json({
        user
    });
})

router.post("/signin", async (req, res) => {
    const { name, password } = req.body as { name?: string, password: string };
    if (!name || name.trim().length < 2 || !password || password.trim().length < 3) {
        res.status(400).json({ error: "Credentails are wrong." });
        return;
    }

    const user = await checkUser(name.trim(), password.trim());

    if (!user) {
        res.status(400).json({ error: "Credentails are wrong." });
        return;
    }
    const payload = {
        sub: user.id
    }
    const secret = process.env.JWT_SECRET as string;
    const token = json.sign(payload, secret, {
        expiresIn: '15m'
    })


    return res.status(200).cookie("accessToken", token).json(user);
})

// GET /api/users — list all users
router.get("/", async (_req, res) => {
    const users = await getAllUsers();
    res.json(users);
});

export default router;
