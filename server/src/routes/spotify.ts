import { Request, Response } from 'express';
import express from 'express';
const SpotifyWebAPI = require("spotify-web-api-node");

const router = express.Router();

const createSpotifyAPI = (refreshToken?: string) => {
    return new SpotifyWebAPI({
        redirectUri: process.env.SPOTIFY_REDIRECT_URL,
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken
    });
};
const login = async (req: Request, res: Response) => {
    try {
        console.log("trying to log in to spotify");
        const bodyCode = req.body.code;
        const spotifyAPI = createSpotifyAPI();

        const data = await spotifyAPI.authorizationCodeGrant(bodyCode);
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in,
        });
    } catch (err) {
        console.log("authorizationCodeGrant error:", err);
        res.sendStatus(400);
    }
};

const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;
        const spotifyAPI = createSpotifyAPI(refreshToken);

        const data = await spotifyAPI.refreshAccessToken();
        res.json({
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in
        });
    } catch (err) {
        console.log("refresh token error:", err);
        res.sendStatus(401);
    }
};

router.post('/login', login);
router.post('/refresh', refresh);

export default router;