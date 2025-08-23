import React, { useState, useEffect, useRef } from "react";
import { FaStepForward, FaStepBackward, FaPlay, FaPause } from "react-icons/fa";
import axios from "axios";
import { AudioPlayerProps, DownloadResponse, SongObj } from "../../types";

const serverURL = import.meta.env.VITE_SERVER_URL;

const MainAudioPlayer = ({ songs, audioPaused, socket, roomId, partyMode, onCurrentSongChange }) => {
    const [currentAudioUrl, setCurrentAudioUrl] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progressTime, setProgressTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);


    const [populatedSongInfo, setPopulatedSongInfo] = useState([]);
    const audioRef = useRef(null);

    // TODO: retrival should be done in the backend
    const retrieveAudio = async (songIndex) => {
        try {
            // Call the server to download the song
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

    const trackSongStartTime = () => {
        // Your existing implementation
    };

    const updateSongIndex = () => {
        // Your existing implementation
    };

    const updateSongProgressTime = () => {
        // Your existing implementation
    };

    const handleFirstSong = async () => {
        // make sure we are not overriding the first playing song when new songs are added
        if (audioRef.current !== null && !audioRef.current.paused) {
            return;
        }

        if (!partyMode) {
            updateSongIndex();
            updateSongProgressTime();
        }

        const firstAudio = await retrieveAudio(currentIndex);
        setCurrentAudioUrl(firstAudio);
        if (audioRef.current) {
            audioRef.current.currentTime = progressTime;
        }
        trackSongStartTime();
    }

    const handleNext = async () => {
        // TODO: circle back to the first song if the current index is the last song
        if (currentIndex + 1 >= songs.length) {
            console.log("index out of range, song len: " + songs.length)
            return;
        }
        const nextSongIdx = currentIndex + 1;
        let audioUrl = populatedSongInfo[nextSongIdx]?.audioUrl;

        //TODO: add a retry or better info mechnisim
        if (!audioUrl) {
            console.log("Audio url is empty, retrying...");
            audioUrl = await retrieveAudio(nextSongIdx);
        }
        setCurrentAudioUrl(audioUrl);
        setCurrentIndex(nextSongIdx);
        trackSongStartTime();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handlePrevious = async () => {
        if (currentIndex - 1 < 0) {
            console.log("Already at first song");
            return;
        }
        const prevSongIdx = currentIndex - 1;
        let audioUrl = populatedSongInfo[prevSongIdx]?.audioUrl;

        if (!audioUrl) {
            console.log("Audio url is empty, retrying...");
            audioUrl = await retrieveAudio(prevSongIdx);
        }
        setCurrentAudioUrl(audioUrl);
        setCurrentIndex(prevSongIdx);
        trackSongStartTime();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        if (!duration) return 0;
        return (currentTime / duration) * 100;
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
                        // Call the server to download the song
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


    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [currentAudioUrl]);

    // detect pausing
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audioPaused) {
            audio.pause();
        } else {
            audio.play();
        }
    }, [audioPaused])

    const pauseAndPlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const isPaused = audio.paused;
        const progressTime = audio.currentTime;

        if (socket) {
            socket.emit("pauseAndPlayEvent", { roomId, isPaused, progressTime })
        }
    }

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;              // Click position
        const progressWidth = rect.width;                  // Total bar width
        const clickPercentage = clickX / progressWidth;    // Percentage clicked
        const newTime = clickPercentage * duration;        // Convert to seconds

        audio.currentTime = newTime;                       // Seek audio
        setCurrentTime(newTime);                          // Update state
    };

    const getCurrentSong = () => songs[currentIndex];
    const currentSong = getCurrentSong();
    useEffect(() => {
        if (songs.length > 0 && currentSongIndex < songs.length) {
            // Notify parent component about current song change
            if (onCurrentSongChange) {
                onCurrentSongChange(currentSongIndex);
            }
        }
    }, [currentSongIndex, songs, onCurrentSongChange]);

    // Notify parent when current index changes
    useEffect(() => {
        if (onCurrentSongChange) {
            onCurrentSongChange(currentIndex);
        }
    }, [currentIndex, onCurrentSongChange]);
    return (
        <section className="p-6 bg-[#F8F8F6] relative">
            <div className="flex items-center gap-4">
                {/* Album Art with Animation */}
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                        {currentSong?.spotifyData?.track?.album?.images?.[0] ? (
                            <img
                                src={currentSong.spotifyData.track.album.images[0].url}
                                alt="Album art"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            '🎭'
                        )}
                    </div>
                    {/* Pulse ring for currently playing */}
                    {isPlaying && (
                        <div className="absolute inset-0 rounded-xl bg-purple-400/30 animate-pulse"></div>
                    )}
                    {/* Live indicator */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                        <span className="block truncate sm:whitespace-normal sm:break-words">
                            {currentSong?.spotifyData?.track?.name || 'No song selected'}
                        </span>
                    </h2>
                    <p className="text-purple-600 font-medium text-sm sm:text-base">
                        <span className="block truncate sm:whitespace-normal sm:break-words">
                            {currentSong?.spotifyData?.track?.artists?.[0]?.name || 'Unknown artist'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div
                    className="w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-center items-center gap-6 mt-4">
                <button
                    onClick={handlePrevious}
                    className="p-3 rounded-full hover:shadow-lg transition-shadow text-gray-700 hover:text-purple-600"
                >
                    <span className="flex items-center">
                        <div className="w-[2px] h-4 bg-current ml-1"></div>
                        <FaPlay className="text-sm rotate-180" />

                    </span> 
                </button>

                <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-gray-600 text-white shadow-lg hover:shadow-xl transition-shadow hover:scale-105"
                >
                    {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg ml-1" />}
                </button>

                <button
                    onClick={handleNext}
                    className="p-3 rounded-full hover:shadow-lg transition-shadow text-gray-700 hover:text-purple-600"
                >
                    <span className="flex items-center">
                        <FaPlay className="text-sm" />
                        <div className="w-[2px] h-4 bg-current ml-1"></div>
                    </span>                
                </button>
            </div>

            {/* Hidden audio element */}
            {currentAudioUrl && (
                <audio
                    ref={audioRef}
                    src={currentAudioUrl}
                    onEnded={handleNext}
                    onPlay={pauseAndPlay}
                    onPause={pauseAndPlay}
                    autoPlay
                    className="hidden"
                />
            )}
        </section>
    );
};

export default MainAudioPlayer;