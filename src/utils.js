


/**
 * @param {import("@spotify/web-api-ts-sdk").SavedTrack[]} tracks
 */
export function getUniqueTrackUrisSorted(tracks) {
    const sorted = [...tracks].toSorted(
        (a, b) => {
            const compare = b.track.album.artists?.[0]?.name.localeCompare(b.track.album.artists?.[0]?.name);
            if(compare !== 0) {
                return compare;
            }
            return b.track.album.name.localeCompare(b.track.album.name)
        });

    const set = new Set();
    sorted.forEach(t => {
        if (set.has(t.track.uri)) {
            return;
        }
        set.add(t.track.uri);
    })
    return [...set];
}
