import 'dotenv/config'
import {SpotifyApi} from "@spotify/web-api-ts-sdk";
import {SPOTIFY_SCOPES} from "./config.js";


const spotifyApi = SpotifyApi.withClientCredentials(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    SPOTIFY_SCOPES
);
