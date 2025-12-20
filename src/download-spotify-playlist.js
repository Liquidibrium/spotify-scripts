import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import * as fs from "node:fs";
import {downloadYoutubeAudio} from "./youtube-audio.js";

console.log("starting user authentication...");
const sdk = await getUserAuthenticatedSpotifySdk()
console.log("Created sdk");
const service = new SpotifyService(sdk);

// console.log(await sdk.currentUser.tracks.savedTracks())
let playlists = await service.listUserPlaylists();

function createDirectory(directory) {
    fs.mkdirSync(directory, {recursive: true});
}

async function getYoutubeLink(api_song_link) {
    let response = await fetch(api_song_link);
    let data = await response.json();
    return data.linksByPlatform?.youtube?.url;
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function downloadAudio(track, folder, trackFilename) {
    const api_song_link = `https://api.song.link/v1-alpha.1/links?url=${track.external_urls.spotify}`;
    const youtubeLink = await getYoutubeLink(api_song_link);
    if (youtubeLink) {
        try {
            console.log(`Downloading ${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`);
            let filename = await downloadYoutubeAudio(youtubeLink, folder);
            let extension = filename?.split('.').pop();
            fs.renameSync(filename, `${folder}/${trackFilename}.${extension}`);
            return true;
        } catch (error) {
            console.error(error);
        }
    } else {
        console.error(`No youtube link found for ${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`);
    }
    return false;
}

async function downloadAlbumArt(track, folder, trackFilename) {
    const albumImages = track.album.images.map(image => image.url)
    // get second image if not exists get first image
    const index = albumImages.length > 1 ? 1 : 0;
    const imageUrl = albumImages[index];
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(`${folder}/${trackFilename}.jpg`, Buffer.from(buffer));
}

async function downloadLyrics(track, folder, trackFilename) {


}

async function processTrack(track, folder) {
    await sleep(1)
    let trackFilename = `${track.name} - ${track.artists.map(artist => artist.name).join(", ")}`;
    const success = await downloadAudio(track, folder, trackFilename);
    if (!success) {
        console.error(`Failed to download ${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`);
        return null;
    }
    // download album art
    await downloadAlbumArt(track, folder, trackFilename);
    // download lyrics if exists
    await downloadLyrics(track, folder, trackFilename);
    return {
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        id: track.id,
        uri: track.uri,
        album: track.album.name,
        album_images: track.album.images.map(image => image.url),
        images: track.images?.map(image => image.url),
        url: track.external_urls.spotify,
        external_ids: track.external_ids,
    }
}

async function processPlaylist(playlist) {
    console.log({
        name: playlist.name,
        owner: playlist.owner.display_name,
        description: playlist.description,
        id: playlist.id,
        href: playlist.href,
        url: playlist.external_urls.spotify,
        uri: playlist.uri,
        tracks: playlist.tracks
    });
    // create directory if not exists recursively with playlist name
    const directory = `./downloads/${playlist.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    createDirectory(directory);

    const playlistTracks = await service.listPlaylistTracks(playlist.id);
    const tracks = [];
    for (const item of playlistTracks) {
        tracks.push(await processTrack(item.track, directory));
        process.exit(0)
    }
    //
    // // list files in directory
    // // remove "NA -", " (Official Video)", " (Official Audio)", " (Audio)", " [Official Music Video]", " (Official Visualiser)" from file titles
    // fs.readdirSync(directory).forEach(filename => {
    //     let newFilename = filename
    //         .replace(/^NA - /g, '')
    //         .replace(/ \(Official Video\)/g, '')
    //         .replace(/ \(Official Audio\)/g, '')
    //         .replace(/ \(Audio\)/g, '')
    //         .replace(/ \[Official Music Video\]/g, '')
    //         .replace(/ \(Official Visualiser\)/g, '');
    //     if (newFilename !== filename) {
    //         fs.renameSync(`${directory}/${filename}`, `${directory}/${newFilename}`);
    //     }
    // })

    console.log(tracks);
}

for (const playlist of playlists.filter(p => p.name === ".. Ever After" || p.name === "Perfect Circles")) {
    await processPlaylist(playlist)
}

console.log(`listed all ${playlists.length} playlists`);
process.exit(0);


