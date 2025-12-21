import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import * as fs from "node:fs";
import cliProgress from "cli-progress";
import {processTrack} from "./downloader/processor.js";

console.log("starting user authentication...");
const sdk = await getUserAuthenticatedSpotifySdk()
console.log("Created sdk");
const service = new SpotifyService(sdk);

// console.log(await sdk.currentUser.tracks.savedTracks())
let playlists = await service.listUserPlaylists();

async function processPlaylist(playlist) {
    // create directory if not exists recursively with playlist name
    const directory = `./downloads/playlists/${playlist.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    fs.mkdirSync(directory, {recursive: true});

    const playlistTracks = await service.listPlaylistTracks(playlist.id);
    // Initialize progress bar
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(playlistTracks.length, 0);

    for (const [index, item] of playlistTracks.entries()) {
        await processTrack(item.track, directory);
        progressBar.update(index + 1); // Update progress bar
    }

    progressBar.stop(); // Stop progress bar
}

// if playlist name is given in args process only that playlist
const args = process.argv.slice(2);
if (args.length > 0) {
    const playlistName = args[0];
    const playlist = playlists.find(p => p.name.toLowerCase() === playlistName.toLowerCase());
    if (playlist) {
        await processPlaylist(playlist);
        console.log(`listed playlist ${playlist.name}`);
        process.exit(0);
    } else {
        console.error(`Playlist ${playlistName} not found`);
        process.exit(1);
    }
}

// for (const playlist of playlists) {
//     await processPlaylist(playlist)
// }
// console.log(`listed all ${playlists.length} playlists`);
process.exit(1);


