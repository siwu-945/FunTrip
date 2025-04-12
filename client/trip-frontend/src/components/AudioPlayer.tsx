import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaStepForward } from "react-icons/fa";

const serverURL = import.meta.env.VITE_SERVER_URL;

type DownloadResponse = {
    audiolink: string;
}

const AudioPlayer: React.FC<{ songs: SpotifyApi.PlaylistTrackObject[] }> = ({ songs }) => {
    const [currentSongId, setCurrentSongId] = useState<string>(songs[0]?.track?.id || "");
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);




    const retrieveAudio = async (songIndex) => {
        try {
            // console.log(songs[0]?.track)
            // console.log(songs)
            console.log("current index: " + currentIndex);
            // console.log("currentSongName" + songs[currentIndex]?.track?.name)
            const downloadedSong = await axios.post<DownloadResponse>(`${serverURL}/download-song`, { 'song': songs[songIndex]?.track?.name })
            setCurrentAudioUrl(downloadedSong.data.audiolink);
            return downloadedSong.data.audiolink;
        } catch {
            console.log("Error getting audio url")
        }

    };

    useEffect(() => {
        if (songs.length > 0) {
            retrieveAudio(currentIndex);
        }
    }, [songs, currentIndex]);


    //TODO
    const togglePlay = () => {
        if (audioRef.current) {
            // if (isPlaying) {
            //     audioRef.current.pause();
            // } else {
            //     audioRef.current.play();
            // }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = async () => {
        if (currentIndex + 1 >= songs.length){
            console.log("currentIndex " + currentIndex)

            console.log("index out of range, song len: " + songs.length)
            return;
        }
        const nextSongIdx = currentIndex + 1;
        const audioUrl = await retrieveAudio(nextSongIdx);

        if(audioUrl){
            setCurrentIndex(nextSongIdx);
            audioRef.current.currentTime = 0;  
            if (isPlaying) {                  
                audioRef.current.play();     
            }
        }
    };

    return (
        <div className="flex items-center justify-between w-full bg-[#585858] p-4 rounded-lg">          
            <div className="flex-shrink-0 min-w-[200px] max-w-[40%]">
                <div className="flex flex-col">
                    <span className="font-semibold text-white truncate max-w-xs">
                        {songs[currentIndex] && songs[currentIndex].track.name || 'No song selected'}
                    </span>
                    <span className="text-[#e0dede] text-sm truncate max-w-xs">
                        {songs[currentIndex] && songs[currentIndex].track?.artists[0]?.name || 'Unknown artist'}
                    </span>
                </div>
            </div>

            {/* Audio controls on the right */}
            <div className="flex-grow flex gap-4">
                <div className="flex items-center gap-2">
                        <button 
                            onClick={handleNext}
                            className="text-white p-2 rounded-full bg-[#6a6a6a] transition"
                        >
                            <FaStepForward size={16} />
                        </button>
                </div>
                {currentAudioUrl && (
                    <audio
                        ref={audioRef}
                        src={currentAudioUrl}
                        onEnded={handleNext}
                        onPlay={togglePlay}
                        controls autoPlay
                        className="w-full h-8"
                    />
                )}
            </div>
        </div>

    );
};

export default AudioPlayer;