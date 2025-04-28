import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaStepForward } from "react-icons/fa";
import { AudioPlayerProps, DownloadResponse, SongObj } from "../types";

const serverURL = import.meta.env.VITE_SERVER_URL;

const AudioPlayer: React.FC<AudioPlayerProps> = ({ songs, audioPaused, socket, roomId}) => {
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [populatedSongInfo, setPopulatedSongInfo] = useState<SongObj[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);


    const retrieveAudio = async (songIndex) => {
        try {
            const downloadedSong = await axios.post<DownloadResponse>(`${serverURL}/download-song`, { 'song': songs[songIndex]?.spotifyData.track?.name })
            return downloadedSong.data.audiolink;
        } catch {
            window.dispatchEvent(
                new CustomEvent("modalError", {
                    detail: { message: "Fail to find the song, try remove the current song and re-add it" },
                })
            );            
            return null;
        }

    };
    const handleFirstSong = async() => {
        // make sure we are not overriding the first playing song when new songs are added
        if(audioRef.current !== null && !audioRef.current.paused){
            return;
        }
        const firstAudio = await retrieveAudio(0);
        setCurrentAudioUrl(firstAudio);
    }
    const handleNext = async () => {
        if (currentIndex + 1 >= songs.length){
            console.log("index out of range, song len: " + songs.length)
            return;
        }
        const nextSongIdx = currentIndex + 1;
        let audioUrl = populatedSongInfo[nextSongIdx]?.audioUrl;
        if(!audioUrl){
            console.log("Audio url is empty, retrying...");
            audioUrl = await retrieveAudio(nextSongIdx);   
        }
        setCurrentAudioUrl(audioUrl);
        setCurrentIndex(nextSongIdx);
        audioRef.current.currentTime = 0;  
    };

    // Play the first song
    useEffect(() => {
        if (songs.length > 0 && currentIndex == 0) {
            handleFirstSong()
        }

        const fetchAudioUrls = async () => {
            const updatedSongs = await Promise.all(
                songs.map(async (song) => {
                    if (!song.audioUrl) {
                        const url = await axios
                            .post<DownloadResponse>(`${serverURL}/download-song`, {
                                song: song.spotifyData.track?.name,
                            })
                            .then((res) => res.data.audiolink)
                            .catch(() => null);

                        return { ...song, audioUrl: url };
                    }
                    return song;
                })
            );

            setPopulatedSongInfo(updatedSongs)
        }
        fetchAudioUrls();
    }, [songs]);

    // detect pausing
    useEffect(()=> {
        const audio = audioRef.current;
        if (!audio) return;

        if(audioPaused){
            audio.pause();
        }else{
            audio.play();
        }
    }, [audioPaused])

    const pauseAndPlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const isPaused = audio.paused;

        socket.emit("pauseAndPlayEvent", {roomId, isPaused})
    }

    return (
        <div className="flex items-center justify-between w-full bg-[#585858] p-4 rounded-lg">          
            <div className="flex-shrink-0 min-w-[200px] max-w-[40%]">
                <div className="flex flex-col">
                    <span className="font-semibold text-white truncate max-w-xs">
                        {songs[currentIndex] && songs[currentIndex].spotifyData.track.name || 'No song selected'}
                    </span>
                    <span className="text-[#e0dede] text-sm truncate max-w-xs">
                        {songs[currentIndex] && songs[currentIndex].spotifyData.track?.artists[0]?.name || 'Unknown artist'}
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
                        onPlay={pauseAndPlay}
                        onPause={pauseAndPlay}
                        controls autoPlay
                        className="w-full h-8"
                    />
                )}
            </div>
        </div>

    );
};

export default AudioPlayer;