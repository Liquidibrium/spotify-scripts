


export function getUniqueTrackUris(tracks) {
    const tracksUri = new Set();
    tracks.forEach(t => tracksUri.add(t.track.uri));
    return [...tracksUri];
}
