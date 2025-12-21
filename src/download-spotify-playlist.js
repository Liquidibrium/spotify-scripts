import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import * as fs from "node:fs";
import {downloadYoutubeAudio} from "./youtube-audio.js";
import fetchLyricsFromLRCLib from "./lyrics.js";
import {updateTrackMedata} from "./ffmpeg-utils.js";

import cliProgress from "cli-progress";

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
    console.log("fetching youtube link from song.link for", spotify_url);
    const api_song_link = `https://api.song.link/v1-alpha.1/links?url=${spotify_url}`;
    let response = await fetch(api_song_link);
    let data = await response.json();
    return data.linksByPlatform?.youtube?.url;
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function downloadAudio(track, folder, trackName) {
    const youtubeLink = await getYoutubeLink(track.external_urls.spotify);
    if (youtubeLink) {
        try {
            return await downloadYoutubeAudio(youtubeLink, folder, trackName);
        } catch (error) {
            console.error("could not download", youtubeLink, error);
        }
    } else {
        console.error(`No youtube link found for ${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`);
    }
    return null;
}

async function downloadAlbumArt(track, folder, trackName) {
    console.log(`Downloading album for ${trackName}`);
    const albumImages = track.album.images?.map(image => image.url)
    // get second image if not exists get first image
    const index = albumImages.length > 1 ? 1 : 0;
    if (albumImages?.length === 0) {
        return null;
    }
    const imageUrl = albumImages[index];
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const file = `${folder}/${trackName}.jpg`;
    fs.writeFileSync(file, Buffer.from(buffer));
    return file;
}

async function downloadLyrics(track, folder, trackName) {
    console.log(`Downloading lyrics for ${trackName}`);
    const lyrics = await fetchLyricsFromLRCLib(track.artists[0].name, track.name);
    const file = `${folder}/${trackName}.lrc`;
    if (lyrics) {
        fs.writeFileSync(file, lyrics);
        return file;
    }
    return null;
}

/**
 *
 * @param track {import("@spotify/web-api-ts-sdk").TrackItem}
 * @param folder {string}
 * @return {Promise<void>}
 */
async function processTrack(track, folder) {
    // await sleep(1)
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
        genres: track.album.genres,
    })
    let trackName = `${track.name.trim()} - ${track.artists.map(artist => artist.name.trim()).join(", ")}`;
    console.log(`Downloading ${trackName}`);
    const songFile = await downloadAudio(track, folder, trackName);
    if (!songFile) {
        console.error(`Failed to download ${trackName}`);
        return;
    }
    // download album art
    const albumCoverFile = await downloadAlbumArt(track, folder, trackName);
    if (!albumCoverFile) {
        console.error(`Failed to download album art for ${trackName}`);
    }
    // download lyrics if exists
    const lyricsFile = await downloadLyrics(track, folder, trackName);
    if (!lyricsFile) {
        console.error(`Failed to download lyrics for ${trackName}`);
    }

    // Updating track metadata
    await updateTrackMedata(track, songFile, albumCoverFile, lyricsFile);
    console.log(`Finished ${trackName}`);
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


