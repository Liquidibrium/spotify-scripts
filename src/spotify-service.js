export class SpotifyService {
    /**
     * @param {import("@spotify/web-api-ts-sdk").SpotifyApi} spotifyApi
     */
    constructor(spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

    /**
     *
     * @return {Promise<import("@spotify/web-api-ts-sdk").SavedTrack[]>}
     */
    async userSavedTracks() {
        const fetchPage = (limit, offset) => this.spotifyApi.currentUser.tracks.savedTracks(limit, offset);
        const tracks = [];
        for await (const track of pagedIterator(fetchPage)) {
            tracks.push(track);
        }
        return tracks;
    }

    async createPlaylist(tracksUris, playlistDetails) {

        const currentUser = await this.spotifyApi.currentUser.profile();

        const newPlaylist = await this.spotifyApi.playlists.createPlaylist(currentUser.id, playlistDetails);

        for (let batch_index = 0; batch_index < tracksUris.length; batch_index += 50) {

            console.log(`adding tracks ${batch_index}`);
            const lastIndex = batch_index + 50 < tracksUris.length ? batch_index + 50 : tracksUris.length;
            await this.spotifyApi.playlists.addItemsToPlaylist(newPlaylist.id, tracksUris.slice(batch_index, lastIndex));
        }
    }

    async listUserPlaylists() {
        const fetchPage = (limit, offset) => this.spotifyApi.currentUser.playlists.playlists(limit, offset);
        const playlists = [];
        for await (const track of pagedIterator(fetchPage)) {
            playlists.push(track);
        }
        return playlists;
    }


    /**
     *
     * @return {Promise<import("@spotify/web-api-ts-sdk").PlaylistedTrack[]>}
     */
    async listPlaylistTracks(playlistId) {
        const fetchPage = (limit, offset) => this.spotifyApi.playlists.getPlaylistItems(playlistId, "NA", undefined, limit, offset);
        const tracks = [];
        for await (const track of pagedIterator(fetchPage)) {
            tracks.push(track);
        }
        return tracks;
    }

    /**
     *
     * @return {Promise<import("@spotify/web-api-ts-sdk").Track[]>}
     */
    async getTopTracks(timeRange = "medium_term") {
        let tracks = [];
        let offset = 0;
        let stop = false;
        do {
            const response = await this.spotifyApi.currentUser.topItems("tracks", timeRange, 50, offset);
            offset += response.limit;
            tracks.push(...response.items);
            stop = response.total < offset;
        } while (!stop);

        return tracks;
    }
}

/**
 * Generic function to handle paginated data.
 * @param {Function} fetchPage - A function that fetches a page of data. It should accept `limit` and `offset` as arguments and return a Promise with the response.
 * @param {number} limit - The number of items to fetch per page.
 * @return {AsyncGenerator<*, void, unknown>} - An async generator yielding items from all pages.
 */
async function* pagedIterator(fetchPage, limit = 50) {
    let offset = 0;
    let stop = false;

    while (!stop) {
        const response = await fetchPage(limit, offset);
        yield* response.items;

        offset += response.limit;
        stop = response.total <= offset;
    }
}
