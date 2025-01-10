/*
    SW is a client-side programmable proxy between the web app and the outside world
    gives control to network requests
 */

self.addEventListener('fetch', (event) => {
    if (
        event.request.method === 'PUT' &&
        event.request.url.includes('gue1-spclient.spotify.com/track-playback')
    ) {
        console.log('Intercepted Spotify PUT request:', event.request);

        event.request.clone().json().then((body) => {
            console.log('Request Body:', body);
        });

        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ type: 'SONG_ENDED' });
            });
        });
    }

    // Pass through all other requests
    event.respondWith(fetch(event.request));
});

self.addEventListener('activate', () => {
    console.log('sw activate');
});