## Setup Instructions

### Prerequisites

```shell

brew install yt-dlp
brew install ffmpeg

cp .env.example .env
npm install
```

## Usage
download a Spotify playlist and convert it to audio files:
```shell
node src/download-spotify-playlist.js
```
To create a playlist from liked tracks on Spotify:
```shell
node src/likes-songs-playlist.js
```
create top tracks playlist:
```shell
node src/top-tracks-playlist.js
```
