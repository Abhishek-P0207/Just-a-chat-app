import { Router, type IRouter } from "express";
import { registerUser, getAllUsers } from "../controllers/userController.js";

const router: IRouter = Router();

// POST /api/users/register — register or retrieve a user by name
router.post("/register", async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name || name.trim().length < 2) {
        res.status(400).json({ error: "Name must be at least 2 characters." });
        return;
    }
    const user = await registerUser(name.trim());
    res.json(user);
});

// GET /api/users — list all users
router.get("/", async (_req, res) => {
    const users = await getAllUsers();
    res.json(users);
});

export default router;
