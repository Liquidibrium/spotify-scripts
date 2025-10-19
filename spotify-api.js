const token = process.env.SPOTIFY_TOKEN;

async function fetchWebApi(endpoint, method, body) {
    // Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
    const initRequest = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method,
    };

    if (body) {
        initRequest["body"] = JSON.stringify(body);
    }

    const res = await fetch(`https://api.spotify.com/${endpoint}`, initRequest);
    return await res.json();
}

export async function getTopTracks(timeTerm) {
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    const response = await fetchWebApi(
        `v1/me/top/tracks?time_range=${timeTerm}&limit=50`, 'GET'
    );
    return response.items;
}

export async function createPlaylist(tracksUri) {
    const {id: user_id} = await fetchWebApi('v1/me', 'GET')

    const playlist = await fetchWebApi(
        `v1/users/${user_id}/playlists`, 'POST', {
            "name": "ToTr",
            "description": "Top listened Tracks",
            "public": true
        })

    await updatePlaylist(tracksUri, playlist.id)
    return playlist;
}

export async function updatePlaylist(tracksUri, playlistId) {
    const response = await fetchWebApi(
        `v1/playlists/${playlistId}/tracks`, 'POST', {
            "uris": tracksUri,
        })

    console.log("updated playlist", response)
}


export async function getPlaylistTracks(playlistId) {
    const response = await fetchWebApi(
        `v1/playlists/${playlistId}/tracks`, 'GET')

    // todo: add pagination
    console.log(`total items in playlist : ${response.total} LIMIT:${response.limit}`);
    return response.items;
}


export async function getSavedSongs() {
    let offset = 0;
    const result = [];
    do {

    const response = await fetchWebApi(
        `v1/me/tracks?offset=${offset}`, 'GET')
        console.log(response);
        result.push(...response.items);
        offset += response.offset + response.total;
    } while (false);

    return result;
}


