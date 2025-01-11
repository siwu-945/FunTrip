import React, {useEffect, useState} from "react";
const serverURL = import.meta.env.VITE_SERVER_URL;

const AudioPlayer : React.FC<{songs : SpotifyApi.PlaylistTrackObject[]}> = ({songs}) => {
    if(songs.length == 0) return;

    const[currentSongId, setCurrentSongId] = useState<string>(songs[0]?.track?.id || "");
    const showSongInfo = () => {
        songs.forEach((song) => {
            console.log(song.track);
        })
    }
    const handleSongEnd = () => {
        const currentIndex = songs.findIndex((song) => song.track?.id === currentSongId);
        const nextSong = songs[currentIndex + 1];
        if (nextSong) {
            setCurrentSongId(nextSong.track?.id || "");
        }
    };
    const progressBar = document.getElementById("progress-bar-slider") as HTMLElement;
    const progressBar2 = Array.from(document.querySelectorAll("[class*='ProgressBar_progressBarContainer']")) as HTMLElement[];

    // useEffect(() => {
    //     const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    //     const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;;
    //     const elements = iframeDoc?.querySelectorAll("[class*='ProgressBar_progressBarContainer']");
    //     elements?.forEach((a) => {
    //         console.log(a);
    //     })
    // }, [songs, currentSongId]);

    return (
        <div>
            <div className="w-full p-4">
                <iframe
                    // src={`${serverURL}/api/spotify/embeded/embed/track/${currentSongId}?utm_source=generator`}
                    // src={`https://open.spotify.com/embed/track/4pygC5qv832l1OfCW7ZLjO?utm_source=generator`}
                    src={`${serverURL}/embeded/embed/track/${currentSongId}?utm_source=generator`}
                    width="100%"
                    height="100"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="shadow-lg"
                ></iframe>
            </div>

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
