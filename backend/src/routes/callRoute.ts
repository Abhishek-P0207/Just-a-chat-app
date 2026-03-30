import { AccessToken } from "livekit-server-sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/getToken", async (req,res) => {
    const roomName: string = req.query.room as string;
    const username: string = req.query.username as string;

    const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: username }
    )

    token.addGrant({ roomJoin: true, room: roomName });

    const accessToken = await token.toJwt();
    res.json({ token: accessToken });
})

export default router;