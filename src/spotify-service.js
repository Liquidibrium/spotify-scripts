export class SpotifyService {
    constructor(spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

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
            tracks.push(...response.items,);


            stop = response.total < offset;
        } while (!stop);

        return tracks;
    }

    async createPlaylist(tracksUris, playlistDetails) {

        const currentUser = await this.spotifyApi.currentUser.profile();

        const newPlaylist = await this.spotifyApi.playlists.createPlaylist(currentUser.id, playlistDetails);

        await this.spotifyApi.playlists.addItemsToPlaylist(newPlaylist.id, tracksUris);


    }


}
