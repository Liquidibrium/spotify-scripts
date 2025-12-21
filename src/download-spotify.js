#!/usr/bin/env node

import {getUserAuthenticatedSpotifySdk} from "./SpotifySDK.js";
import {SpotifyService} from "./spotify-service.js";
import {processAlbum, processPlaylist, processSpotifyUrl, processTrack} from "./downloader/processor.js";

import {Command} from "commander";

const program = new Command();

function collect(value, previous = []) {
    return previous.concat(value);
}

program
    .name("fetcher-cli")
    .description("Process playlists, albums, and tracks")
    .option("--playlist <name>", "Playlist name", collect)
    .option("--album <name>", "Album name name|artist", collect)
    .option("--track <track>", "Track in format name|artist", collect)
    .option("--allPlaylists", "Process all playlists", false)
    .option("--spotifyUrl <url>", "Spotify URL to process", collect)
    .option("--verbose", "Enable verbose logging", false)
    .action(async (options) => {
        const tracks = (options.track || []).map(t => {
            const [name, artist] = t.split("|");
            return {name, artist};
        });
        const albums = (options.albums || []).map(t => {
            const [name, artist] = t.split("|");
            return {name, artist};
        });
        const result = {
            playlists: options.playlist || [],
            albums,
            tracks,
            allPlaylists: options.allPlaylists,
            spotifyUrl: options.spotifyUrl || [],
        };
        console.log(result);
        console.log("starting user authentication...");
        const sdk = await getUserAuthenticatedSpotifySdk()
        console.log("Created sdk");
        const service = new SpotifyService(sdk);

        if (result.allPlaylists) {
            console.log("Processing all playlists...");
            const playlists = await service.listUserPlaylists();
            for (const playlist of playlists) {
                await processPlaylist(service, playlist);
            }
            console.log(`Processed all ${playlists.length} playlists`);
            return;
        }
        for (const playlistName of result.playlists) {
            let playlists = await service.listUserPlaylists();
            const playlist = playlists.find(p => p.name.toLowerCase() === playlistName.toLowerCase());
            if (playlist) {
                await processPlaylist(service, playlist);
            } else {
                console.error(`Playlist ${playlistName} not found`);
            }
        }

        for (const albumInfo of result.albums) {
            const album = await service.findAlbum(albumInfo.name, albumInfo.artist);
            if (album) {
                await processAlbum(service, album);
            } else {
                console.error(`Album ${albumInfo.name} by ${albumInfo.artist} not found`);
            }
        }

        for (const trackInfo of result.tracks) {
            const track = await service.findTrack(trackInfo.name, trackInfo.artist);
            if (track) {
                await processTrack(track, "./downloads/singles");
            } else {
                console.error(`Track ${trackInfo.name} by ${trackInfo.artist} not found`);
            }
        }

        for (const url of result.spotifyUrl) {
            await processSpotifyUrl(service, url)
        }
    })


program.parse(process.argv);
