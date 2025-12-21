import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import * as fs from "node:fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Reads the metadata of a song file.
 * @param {string} songFile - The path to the song file.
 * @return {Promise<object>} - The metadata of the song file.
 */
export async function readTrackMetadata(songFile) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(songFile, (err, metadata) => {
            if (err) {
                console.error(`Failed to read metadata for ${songFile}:`, err);
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
}

/**
 *
 * @param track {import("@spotify/web-api-ts-sdk").TrackItem}
 * @param songFile {string}
 * @param albumCoverFile {string | null}
 * @param lyricsFile {string | null}
 * @return {Promise<string>}
 */
export async function updateTrackMedata(track, songFile, albumCoverFile, lyricsFile) {
    return new Promise((resolve, reject) => {
        console.log(`updating medata for ${songFile}`);
        const command = ffmpeg(songFile);

        const options = [
            `-metadata`, `title=${track.name}`,
            `-metadata`, `artist=${track.artists[0].name}`,
            `-metadata`, `album=${track.album.name}`,
            `-metadata`, `album_artist=${track.album.artists.map(artist => artist.name).join(", ")}`,
            `-metadata`, `tracks_artist=${track.artists.map(artist => artist.name).join(", ")}`,
            `-metadata`, `date=${track.album.release_date}`,
            `-metadata`, `track=${track.track_number}`,
            `-metadata`, `total_tracks=${track.album.total_tracks}`,
            `-metadata`, `disc=${track.disc_number}`,
            `-metadata`, `isrc=${track.external_ids?.isrc || ""}`,
        ];

        if (track.album.genres?.length > 0) {
            options.push(`-metadata`, `genre=${track.album.genres.join(", ")}`);
        }

        // Add album cover if available
        if (albumCoverFile) {
            command.input(albumCoverFile);
            options.push(
                "-map", "0:a",
                "-map", "1:v",
                "-c:a", "copy",
                "-c:v", "mjpeg",
                "-id3v2_version", "3",
                "-metadata:s:v", "title=Album cover",
                "-metadata:s:v", "comment=Cover (front)",
                "-disposition:v", "attached_pic"
            );
        }

        command
            .outputOptions(...options);

        // Save the updated file
        const outputFile = songFile.replace(/\.([^.]*)$/, "_updated.$1");
        command
            .save(outputFile)
            .on("end", () => {
                // replace original file with updated file
                fs.renameSync(outputFile, songFile);
                resolve(songFile);
            })
            .on("error", (err) => {
                console.error(`Failed to update metadata for ${track.name}:`, err);
                reject(err);
            });
    });
}
