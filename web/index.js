import {SpotifyApi} from "@spotify/web-api-ts-sdk";

const SPOTIFY_SCOPES = ['playlist-read-private',
    "user-library-read",
    "user-read-private",
    'app-remote-control',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-collaborative',
    'user-read-playback-position',
    'user-library-modify'];

await SpotifyApi.performUserAuthorization(
    window.__ENV__.PUBLIC_CLIENT_ID,
    "http://127.0.0.1:3000",
    SPOTIFY_SCOPES,
    "http://127.0.0.1:3000/accept-user-token");
