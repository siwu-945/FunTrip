import React, {useEffect, useState} from "react";

const AudioPlayer : React.FC<{songs : SpotifyApi.PlaylistTrackObject[]}> = ({songs}) => {
    if(songs.length == 0) return;

    const[currentSongId, setCurrentSongId] = useState<string>(songs[0]?.track?.id || "");

    const handleSongEnd = () => {
        const currentIndex = songs.findIndex((song) => song.track?.id === currentSongId);
        const nextSong = songs[currentIndex + 1];
        if (nextSong) {
            setCurrentSongId(nextSong.track?.id || "");
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log(event.data);
            if (event.data?.type === "SONG_ENDED") {
                console.log("Received SONG_ENDED event from service worker");
                handleSongEnd();
            }
        };
        navigator.serviceWorker.addEventListener("message", handleMessage);

        return () => {
            navigator.serviceWorker.removeEventListener("message", handleMessage);
        };
    }, [songs]);


    return (
        <div>
            <div className="w-full p-4">
                <iframe
                    src={`https://open.spotify.com/embed/track/${currentSongId}?utm_source=generator`}
                    width="100%"
                    height="100"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="shadow-lg"
                ></iframe>
            </div>

            {/* Simulated song-end detection button */}
            <div className="p-4">
                <button
                    onClick={handleSongEnd}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                >
                    Next Song
                </button>
            </div>
        </div>
    );
};

export default AudioPlayer;
