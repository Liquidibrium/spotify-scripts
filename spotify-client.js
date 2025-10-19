import 'dotenv/config'
import {SpotifyApi} from "@spotify/web-api-ts-sdk";


// const spotifyApi = SpotifyApi.withClientCredentials(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     scopes
// );

await SpotifyApi.performUserAuthorization(
    process.env.CLIENT_ID,
    "http://127.0.0.1:3000",
    scopes,
    (accessToken) => {
    console.log(accessToken);
});

    /* do postback here */
// const r = await SpotifyApi.performUserAuthorization(
//     process.env.CLIENT_ID,
//     "https://localhost:8000/token",
//     scopes,
//     "https://localhost:8000/postback"
// );
// console.log(r)

// console.log(await spotifyApi.authenticate())
// console.log(await spotifyApi.currentUser.tracks.savedTracks())
