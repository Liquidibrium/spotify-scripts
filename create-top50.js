
import 'dotenv/config'

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = process.env.SPOTIFY_TOKEN;
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=50', 'GET'
  )).items;
}

const topTracks = await getTopTracks();



async function createPlaylist(tracksUri){
  const { id: user_id } = await fetchWebApi('v1/me', 'GET')

  const playlist = await fetchWebApi(
      `v1/users/${user_id}/playlists`, 'POST', {
        "name": "TT50",
        "description": "Top Tracks, updated monthly",
        "public": false
      })

  await fetchWebApi(
      `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
      'POST'
  );

  return playlist;
}

const tracksUri = topTracks.map( track=> track.uri);
console.log(
    topTracks?.map(
        (track, index) =>
            `${index}: ${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`,
    )
);


const createdPlaylist = await createPlaylist(tracksUri);
console.log(createdPlaylist.name, createdPlaylist.id);
