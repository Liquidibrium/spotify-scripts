import 'dotenv/config'
import {createPlaylist, getPlaylistTracks, getSavedSongs, getTopTracks, updatePlaylist} from "./spotify-api.js";

const playlistId = process.env.PLAYLIST_ID;


const topTracksPast6Month = await getTopTracks("medium_term");
const topTracksPastYear = await getTopTracks("Long_term");
const topTacks = getTopTracksSet();
console.log("top tracks", topTacks.size)

function getTopTracksSet() {
    const tracksUri = new Set();
    topTracksPastYear.forEach(t => tracksUri.add(t.uri))
    topTracksPast6Month.forEach(t => tracksUri.add(t.uri))
    return tracksUri;
}



async function updatePlaylistWithUniqueTracks() {
    const tracks = await getPlaylistTracks(playlistId);
    const playlistTracks = new Set(tracks.map(t => t.track.uri));
    const tracksToAdd = [];
    topTacks.forEach(t => {
        if (!playlistTracks.has(t)) {
            tracksToAdd.push(t)
        }
    })
    console.log(`${tracksToAdd.length} tracks to add`)
    if (tracksToAdd.length === 0) {
        return;
    }
    await updatePlaylist(tracksToAdd, playlistId)
}


// await updatePlaylistWithUniqueTracks();

console.log(getSavedSongs())
// const createdPlaylist = await createPlaylist([...topTacks]);
// console.log(createdPlaylist.name, createdPlaylist.id);
