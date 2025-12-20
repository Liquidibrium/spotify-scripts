import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";

console.log("starting user authentication...");
const sdk = await getUserAuthenticatedSpotifySdk()
console.log("Created sdk");
const service = new SpotifyService(sdk);

const topTracks = await service.getTopTracks("medium_term");
console.log(`Fetched top ${topTracks.length} tracks`);
const playlistName = `Top 50 Tracks - ${new Date().toISOString().split('T')[0]}`;
await service.createPlaylist(topTracks.map(track => track.uri), {
    name: playlistName,
    public: true,
    description: `My top 50 tracks as of ${new Date().toISOString()}`,
})
