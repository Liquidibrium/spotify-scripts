## Setup Instructions

### Prerequisites
#### Spotify
* Create app: https://developer.spotify.com/documentation/web-api/concepts/apps
* Callback urls: http://127.0.0.1:3000, http://127.0.0.1:3000/callback
* Copy secret keys

```shell

brew install yt-dlp
brew install ffmpeg

cp .env.example .env
npm install
```

## Usage
download a Spotify playlist and convert it to audio files:

`node src/download-spotify.js --spotifyUrl <spotify album|track|playlist url> `

```shell
node src/download-spotify.js --help         
Usage: fetcher-cli [options]

Process playlists, albums, and tracks

Options:
  --playlist <name>   Playlist name
  --album <name>      Album in format name|artist
  --track <track>     Track in format name|artist
  --allPlaylists      Process all playlists (default: false)
  --spotifyUrl <url>  Spotify URL to process
  --verbose           Enable verbose logging (default: false)
  -h, --help          display help for command

```
Example:
```shell
node src/download-spotify.js --spotifyUrl https://open.spotify.com/track/0Ppd0oDauQpaQgNvpHzq24
```

To create a playlist from liked tracks on Spotify:
```shell
node src/likes-songs-playlist.js
```
create top tracks playlist:
```shell
node src/top-tracks-playlist.js
```
