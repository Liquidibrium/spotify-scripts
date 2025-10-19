import 'dotenv/config'
import {SpotifyApi} from "@spotify/web-api-ts-sdk";
import open from "open";
import express from "express";

/**

 * @return {Promise<SpotifyApi>}
 */
export async function getUserAuthenticatedSpotifySdk() {
    const app = express();
    const port = 3000;


    const server = app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`);
    });
    return new Promise(async (resolve, rej) => {
        app.use(express.json());
        app.use(express.static("public"));
        app.use('/dist', express.static('dist'));
        app.post('/accept-user-token', async (req, res) => {
            let data = req.body;
            const sdk = SpotifyApi.withAccessToken(process.env.CLIENT_ID, data); // SDK now authenticated as client-side user
            console.log("Spotify SDK authenticated")
            resolve(sdk);
            server.close();
        });

        app.get("/callback", async (req, res) => {

            const token = req.query.code;
            console.log(token);

            res.send("Successfully authenticated!");
        });
        app.get('/env.js', (req, res) => {
            res.set('Content-Type', 'application/javascript');
            res.send(`window.__ENV__ = {
             PUBLIC_CLIENT_ID: "${process.env.CLIENT_ID}"
           };`);
        });
        await open("http://127.0.0.1:3000");
    });

}

