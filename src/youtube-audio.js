import {exec} from "child_process";


export async function downloadYoutubeAudio(youtubeUrl, directory) {
    const command = `
yt-dlp \
  -x \
  --audio-format flac \
  --audio-quality 0 \
  --embed-metadata --embed-thumbnail \
  -o "${directory}/%(artist)s - %(title)s.%(ext)s" \
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
                resolve(match[1]);
                return;
            }
            reject(new Error("no file destination found: " + match));
        });
    })
}
