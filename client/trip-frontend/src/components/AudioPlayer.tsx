import React, {useState} from "react";

const AudioPlayer : React.FC<{songs : SpotifyApi.PlaylistTrackObject[]}> = ({songs}) => {
    const[currentSongId, setCurrentSongId] = useState<string>("");
    const showSongInfo = () => {
        songs.forEach((song) => {
            console.log(song.track);
        })
    }
    return (
        <div>
            <div className="w-full p-4">
                <iframe
                    src={`https://open.spotify.com/embed/track/479lquEL4Mzh3tQLtnHVfL?utm_source=generator`}
                    width="100%"
                    height="100"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="shadow-lg"
                ></iframe>
            </div>
            <button className="btn btn-lg" onClick={() => showSongInfo()}>button</button>
        </div>
    );
};

export default AudioPlayer;
