
/**
 * Fetch lyrics using the LRCLIB API.
 * @param {string} artistName - The name of the artist.
 * @param {string} trackName - The name of the track.
 * @returns {Promise<string|null>} - The lyrics as a string, or null if not found.
 */
async function fetchLyricsFromLRCLib(artistName, trackName) {
    const apiUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(`Failed to fetch lyrics: HTTP ${response.status}`);
            return null;
        }
        const data = await response.json();
        if (data.plainLyrics || data.syncedLyrics) {
            // Prefer synced lyrics if available
            return data.syncedLyrics || data.plainLyrics;
        } else {
            console.error(`No lyrics found for "${trackName}" by "${artistName}".`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching lyrics: ${error.message}`);
        return null;
    }
}

export default fetchLyricsFromLRCLib;
