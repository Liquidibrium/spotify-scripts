import {downloadYoutubeAudio} from "../youtube-audio.js";
import fs from "node:fs";
import fetchLyricsFromLRCLib from "../lyrics.js";

async function getYoutubeLink(spotify_url) {
    console.log("fetching youtube link from song.link for", spotify_url);
    const api_song_link = `https://api.song.link/v1-alpha.1/links?url=${spotify_url}`;
    let response = await fetch(api_song_link);
    let data = await response.json();
    return data.linksByPlatform?.youtube?.url;
}


export async function downloadAudio(track, folder, trackName) {
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

export async function downloadAlbumArt(track, folder, trackName) {
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

export async function downloadLyrics(track, folder, trackName) {
    console.log(`Downloading lyrics for ${trackName}`);
    const lyrics = await fetchLyricsFromLRCLib(track.artists[0].name, track.name);
    const file = `${folder}/${trackName}.lrc`;
    if (lyrics) {
        fs.writeFileSync(file, lyrics);
        return file;
    }
    return null;
}

