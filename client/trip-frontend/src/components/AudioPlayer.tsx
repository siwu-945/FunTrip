import React, {useEffect, useState} from "react";

const AudioPlayer : React.FC<{songs : SpotifyApi.PlaylistTrackObject[]}> = ({songs}) => {
    const[currentSongId, setCurrentSongId] = useState<string>(songs[0]?.track?.id || "");

    const handleSongEnd = () => {
        const currentIndex = songs.findIndex((song) => song.track?.id === currentSongId);
        const nextSong = songs[currentIndex + 1];
        if (nextSong) {
            setCurrentSongId(nextSong.track?.id || "");
        }
    };

    useEffect(() => {
        const trackId = songs[0]?.track?.id;
        if(trackId) setCurrentSongId(trackId);
    }, [songs]);

    return (
        <div>
            {songs.length === 0 ? (
                <></>
            ) : (
                <>
                    <div className="w-full p-4">
                        {currentSongId && (
                            <iframe
                                src={`https://open.spotify.com/embed/track/${currentSongId}?utm_source=generator`}
                                width="100%"
                                height="100"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="shadow-lg"
                            ></iframe>
                        )}
                    </div>
                    <div className="p-4">
                        <button
                            onClick={handleSongEnd}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Next Song
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AudioPlayer;
