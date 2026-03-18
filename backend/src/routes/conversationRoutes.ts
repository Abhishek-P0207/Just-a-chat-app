import { Router, type IRouter } from "express";
import {
    getOrCreateDmConversation,
    getConversationMessages,
} from "../controllers/conversationController.js";

const router: IRouter = Router();

// POST /api/conversations/dm — get or create a DM conversation between two users
router.post("/dm", async (req, res) => {
    const { userId1, userId2 } = req.body as { userId1?: string; userId2?: string };
    if (!userId1 || !userId2) {
        res.status(400).json({ error: "userId1 and userId2 are required." });
        return;
    }
    const conversation = await getOrCreateDmConversation(userId1, userId2);
    res.json({ conversationId: conversation.id });
});

// GET /api/conversations/:convId/messages — fetch all messages in a conversation
router.get("/:convId/messages", async (req, res) => {
    const { convId } = req.params;
    const messages = await getConversationMessages(convId);
    res.json(messages);
});

export default router;
