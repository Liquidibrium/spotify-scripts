import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import * as fs from "node:fs";
import {downloadYoutubeAudio} from "./youtube-audio.js";
import fetchLyricsFromLRCLib from "./lyrics.js";

console.log("starting user authentication...");
const sdk = await getUserAuthenticatedSpotifySdk()
console.log("Created sdk");
const service = new SpotifyService(sdk);

// console.log(await sdk.currentUser.tracks.savedTracks())
let playlists = await service.listUserPlaylists();

function createDirectory(directory) {
    fs.mkdirSync(directory, {recursive: true});
}

async function getYoutubeLink(spotify_url) {
    const api_song_link = `https://api.song.link/v1-alpha.1/links?url=${spotify_url}`;
    let response = await fetch(api_song_link);
    let data = await response.json();
    return data.linksByPlatform?.youtube?.url;
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function downloadAudio(track, folder, trackFilename) {
    const youtubeLink = await getYoutubeLink(track.external_urls.spotify);
    if (youtubeLink) {
        try {
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
    const lyrics = await fetchLyricsFromLRCLib(track.artists[0].name, track.name);
    if (lyrics) {
        fs.writeFileSync(`${folder}/${trackFilename}.lrc`, lyrics);
    }
}

async function processTrack(track, folder) {
    await sleep(1)
    console.log({
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        id: track.id,
        uri: track.uri,
        album: track.album.name,
        album_images: track.album.images.map(image => image.url),
        images: track.images?.map(image => image.url),
        url: track.external_urls.spotify,
        external_ids: track.external_ids,
    })
    let trackFilename = `${track.name} - ${track.artists.map(artist => artist.name).join(", ")}`;
    console.log(`Downloading ${trackFilename}`);
    const success = await downloadAudio(track, folder, trackFilename);
    if (!success) {
        console.error(`Failed to download ${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`);
        return;
    }
    // download album art
    await downloadAlbumArt(track, folder, trackFilename);
    // download lyrics if exists
    await downloadLyrics(track, folder, trackFilename);
    console.log(`Downloaded ${trackFilename}`);
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
    for (const item of playlistTracks) {
        await processTrack(item.track, directory);
    }
}

for (const playlist of playlists) {
    await processPlaylist(playlist)
}

console.log(`listed all ${playlists.length} playlists`);
process.exit(0);


