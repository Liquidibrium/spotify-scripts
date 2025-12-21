import {downloadYoutubeAudio} from "../youtube-audio.js";
import fs from "node:fs";
import fetchLyricsFromLRCLib from "../lyrics.js";
import {updateTrackMedata} from "../ffmpeg-utils.js";

async function getYoutubeLink(spotify_url) {
    console.log("fetching youtube link from song.link for", spotify_url);
    const api_song_link = `https://api.song.link/v1-alpha.1/links?url=${spotify_url}`;
    let response = await fetch(api_song_link);
    let data = await response.json();
    return data.linksByPlatform?.youtube?.url;
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
export async function processTrack(track, folder) {
    // await sleep(1)
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
