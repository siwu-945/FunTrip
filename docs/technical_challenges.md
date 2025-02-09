## Technical Challenges
### Challenge 1: Handling Spotify Media Playback for a Custom Song Queue

#### Limitations of Spotify Web API and Embeds

The Spotify Web API does not provide a built-in media player. While it offers methods for retrieving and manipulating playback data, it lacks the ability to directly play songs.
The Spotify Embeds/iframe functionality allows embedding a simple player in an application using HTML. However, it comes with significant limitations:
It only provides basic playback capabilities (play, pause, etc.) for individual songs or playlists.
It does not expose events or methods to programmatically move to the next song or interact with a custom song queue.

#### The Problem: Synchronizing Spotify Playback with a Custom Song Queue

My application incorporates a custom song queue feature where users can manage a playlist (add/remove songs, reorder them) independent of Spotify’s native playlists.
Since the Spotify iframe player only plays the current song without knowledge of the application’s queue, it cannot automatically transition to the next song in the queue when the current song ends.
Additionally, Spotify's iframe does not provide an API or event listeners to detect when a song ends or allow programmatic control to load the next song.

#### The Solution: Network Activity Monitoring and Dynamic Updates

To overcome this limitation, I analyzed the network activity triggered by the iframe during playback.
I identified the specific network events that occurred when a song ended.
By capturing and monitoring these events, I was able to detect when the current song completed playing.
Once the song-end event was detected, the application dynamically updated the iframe source with the id of the next song in the custom queue.
This approach ensured a seamless playback experience where the iframe player transitioned to the next song in the queue without user intervention.

#### In summary:
This solution demonstrates how to work around third-party API limitations by creatively integrating network monitoring with dynamic DOM manipulation, ensuring that the application delivers the desired functionality without relying on unsupported features of the API.
(I used chatGPT for this write up, but the solution is original)
2. Spotify Authentication
3. Room integration with user retrieved information (cookie?)
4. Synchronization across clients
5. Protect the Song Queue
