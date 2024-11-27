export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';

const scopes = [
    'streaming',                     // Allows playback of Spotify tracks
    'user-read-email',               // Access to the user’s email address
    'user-read-private',             // Access to the user’s subscription details (type of account)
    'user-library-read',             // Access to a user’s saved tracks and albums
    'user-library-modify',           // Modify a user’s saved tracks and albums
    'user-read-playback-state',      // Read a user’s playback state
    'user-modify-playback-state',    // Control playback on a user’s devices
    'playlist-modify-public',        // Write access to a user’s public playlists
    'playlist-modify-private',       // Write access to a user’s private playlists
    'playlist-read-private',         // Access a user’s private playlists
    'playlist-read-collaborative',   // Access collaborative playlists
    'user-follow-read',              // Access the list of artists and other users that the user follows
    'user-follow-modify',            // Manage the list of artists and users that the user follows
    'user-top-read',                 // Access the user’s top artists and tracks
    'app-remote-control',            // Control playback on a Spotify client’s devices
    'user-read-currently-playing'    // Access the currently playing content
];


export const getSpotifyAuthURL = () => {
    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
        scope: scopes.join(' ')
    });
    return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
};