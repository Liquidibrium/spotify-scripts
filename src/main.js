import 'dotenv/config'
import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import {getUniqueTrackUris} from "./utils.js";


console.log("starting user authentication...");
const sdk  = await getUserAuthenticatedSpotifySdk()
console.log("Created sdk");

// console.log(await sdk.currentUser.tracks.savedTracks())
const service = new SpotifyService(sdk);

let savedTracks = await service.userSavedTracks();
let uniqueTrackUris = getUniqueTrackUris(savedTracks);
console.log(uniqueTrackUris)

await service.createPlaylist(uniqueTrackUris, {
    name: "Song Dump",
    public: true,
})
console.log(`Song Dump created: ${uniqueTrackUris.length}`)
