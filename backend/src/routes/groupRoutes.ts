import { Router, type IRouter } from "express";
import { createGroupConversation, getAllGroups } from "../controllers/groupConversationController.js";

const router: IRouter = Router();

// GET /api/groups?userId=... — get all groups for a user
router.get("/", async (req, res) => {
    const { userId } = req.query as { userId?: string };
    if (!userId) {
        res.status(400).json({ error: "userId query param is required." });
        return;
    }
    const groups = await getAllGroups(userId);
    res.json(groups);
});

// POST /api/groups/register — create a new group conversation
router.post("/register", async (req, res) => {
    const { name, members } = req.body as { name?: string; members?: string[] };
    if (!name || !members || !Array.isArray(members) || members.length === 0) {
        res.status(400).json({ error: "group name and at least one member is needed" });
        return;
    }
    const isValidMembersList = members.every((id) => typeof id === "string");
    if (!isValidMembersList) {
        res.status(400).json({ error: "members list should contain only string type" });
        return;
    }
    const conversation = await createGroupConversation(name, members) as unknown as {
        id: string;
        name: string | null;
        participants: { userId: string }[];
    };
    console.log(conversation);
    res.json({
        conversationId: conversation.id,
        name: conversation.name ?? name,
        memberIds: conversation.participants.map((p: { userId: string }) => p.userId),
    });
});

export default router;