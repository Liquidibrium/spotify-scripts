import {updateTrackMedata} from "../ffmpeg-utils.js";
import {downloadAlbumArt, downloadAudio, downloadLyrics} from "./fetcher.js";
import fs from "node:fs";
import cliProgress from "cli-progress";

/**
 *
 * @param track {import("@spotify/web-api-ts-sdk").TrackItem}
 * @param folder {string}
 * @return {Promise<void>}
 */
export async function processTrack(track, folder) {
    let trackName = `${track.name.trim()} - ${track.artists.map(artist => artist.name.trim()).join(", ")}`;
    console.log(`Processing track ${trackName}`);
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
    console.log(`Processed track ${track.name}`);
}

/**
 *
 * @param service {SpotifyService}
 * @param playlist {import("@spotify/web-api-ts-sdk").Playlist}
 * @return {Promise<void>}
 */
export async function processPlaylist(service, playlist) {
    // create directory if not exists recursively with playlist name
    console.log(`Processing playlist ${playlist.name}`);
    const directory = `./downloads/playlists/${playlist.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    fs.mkdirSync(directory, {recursive: true});

    const playlistTracks = await service.listPlaylistTracks(playlist.id);
    // Initialize progress bar
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(playlistTracks.length, 0);

    for (const [index, item] of playlistTracks.entries()) {
        await processTrack(item.track, directory);
        progressBar.update(index + 1); // Update progress bar
        console.log("\n");
    }

    progressBar.stop(); // Stop progress bar
    console.log(`Processed playlist ${playlist.name}`);
}


/**
 *
 * @param service { SpotifyService}
 * @param album {import("@spotify/web-api-ts-sdk").Album}
 * @return {Promise<void>}
 */
export async function processAlbum(service, album) {
    // create directory if not exists recursively with album name
    console.log(`Processing album ${album.name}`);
    const directory = `./downloads/albums/${album.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    fs.mkdirSync(directory, {recursive: true});

    const albumTracks = await service.listAlbumTracks(album.id);
    // Initialize progress bar
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(albumTracks.length, 0);

    for (const [index, item] of albumTracks.entries()) {
        await processTrack({
            ...item,
            album,
            external_ids: {}
        }, directory);
        progressBar.update(index + 1); // Update progress bar
        console.log("\n");
    }

    progressBar.stop(); // Stop progress bar
    console.log(`Processed album ${album.name}`);
}


/**
 *
 * @param service { SpotifyService}
 * @param url
 * @return {Promise<void>}
 */
export async function processSpotifyUrl(service, url) {
    console.log(`Processing Spotify URL: ${url}`);
    const urlObj = new URL(url);
    const paths = urlObj.pathname.split("/").filter(p => p);
    if (paths.length < 2) {
        console.error(`Invalid Spotify URL: ${url}`);
        return;
    }
    const [type, id] = paths;
    if (type === "playlist") {
        const playlist = await service.getPlaylistById(id)
        if (playlist) {
            await processPlaylist(service, playlist);
        } else {
            console.error(`Playlist with ID ${id} not found`);
        }
    } else if (type === "album") {
        const album = await service.getAlbumById(id);
        if (album) {
            await processAlbum(service, album);
        } else {
            console.error(`Album with ID ${id} not found`);
        }
    } else if (type === "track") {
        const track = await service.getTrackById(id);
        if (track) {
            await processTrack(track, "./downloads/singles");
        } else {
            console.error(`Track with ID ${id} not found`);
        }
    } else {
        console.error(`Unsupported Spotify URL type: ${type}`);
    }
}
