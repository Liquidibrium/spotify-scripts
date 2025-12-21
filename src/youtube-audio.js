import {exec} from "child_process";
import * as fs from "node:fs";


export async function downloadYoutubeAudio(youtubeUrl, directory, trackName) {
    const command = `
yt-dlp \
  -x \
  --audio-format flac \
  --audio-quality 0 \
  --embed-metadata --embed-thumbnail \
  -o "${directory}/%(title)s - %(artist)s.%(ext)s" \
  "${youtubeUrl}"
`;

    return new Promise((resolve, reject) => {
        console.log(`Downloading youtube audio: ${youtubeUrl}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Error:", error.message);
                reject(error);
                return;
            }
            if (stderr) {
                if (stderr.includes("WARNING")) {
                    console.warn("yt-dlp warning:", stderr);
                } else {
                    console.error("yt-dlp stderr:", stderr);
                    reject(new Error(stderr));
                    return;
                }
            }
            // extract filename from stdout
            const match = RegExp(/^\[ExtractAudio] Destination: (.+)$/m).exec(stdout);
            if (match?.[1]) {
                const filename = match[1];
                let extension = filename?.split('.').pop();
                const file = `${directory}/${trackName}.${extension}`;
                try {
                    fs.renameSync(filename, file);
                    resolve(file);
                } catch (error) {
                    console.error(error, "\nOUTPUT:\n", stdout);
                    reject(error)
                }
                return;
            }
            reject(new Error("no file destination found: " + match));
        });
    })
}
