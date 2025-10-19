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
        let tracks = [];
        let offset = 0;
        let stop = false;
        do {
            let response = await this.spotifyApi.currentUser.tracks.savedTracks(50, offset);
            offset += response.limit;
            console.log({
                tracks: response.items.length,
                newOffset: offset
            })
            tracks.push(...response.items);


            stop = response.total < offset;
        } while (!stop);

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
}
