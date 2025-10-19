import 'dotenv/config'
import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import {getUniqueTrackUrisSorted} from "./utils.js";


console.log("starting user authentication...");
const sdk  = await getUserAuthenticatedSpotifySdk()
console.log("Created sdk");

// console.log(await sdk.currentUser.tracks.savedTracks())
const service = new SpotifyService(sdk);

let savedTracks = await service.userSavedTracks();
let uniqueTrackUris = getUniqueTrackUrisSorted(savedTracks);
console.log(uniqueTrackUris.length);

await service.createPlaylist(uniqueTrackUris, {
    name: "Song Dump",
    public: true,
    description: `Dumpster ${new Date().toISOString()}`,
})
console.log(`Song Dump created: ${uniqueTrackUris.length}`)
