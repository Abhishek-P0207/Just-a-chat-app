import { AccessToken } from "livekit-server-sdk";
import { Router } from "express";
const router = Router();
router.get("/getToken", async (req, res) => {
    const roomName = req.query.room;
    const username = req.query.username;
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: username });
    token.addGrant({ roomJoin: true, room: roomName });
    const accessToken = await token.toJwt();
    res.json({ token: accessToken });
});
export default router;
//# sourceMappingURL=callRoute.js.map