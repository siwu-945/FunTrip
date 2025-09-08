import { useEffect, useState } from "react";

export const GuestAudioPlayer = ({ songs, audioPaused, socket, roomId, currentIndex, setCurrentIndex }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (socket) {
            const handleSongIndexUpdated = ({ songIndex }: { songIndex: number; songName?: string }) => {
                setCurrentIndex(songIndex);
            };

            socket.on("songIndexUpdated", handleSongIndexUpdated);

            return () => {
                socket.off("songIndexUpdated", handleSongIndexUpdated);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handlePlaybackStarted = (progress) => {
            setIsPlaying(true);
        };

        const handlePlaybackPaused = (progress) => {
            setIsPlaying(false);
        };
        socket.on("playbackStarted", handlePlaybackStarted);
        socket.on("playbackPaused", handlePlaybackPaused);

        return () => {
            socket.off("playbackStarted", handlePlaybackStarted);
            socket.off("playbackPaused", handlePlaybackPaused);
        };
    }, [socket, currentIndex]);


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

    
    return (
        <section className="pt-4 pl-6 pr-6 pb-6 bg-[#f8f8eb] relative">
            <div className="flex items-center gap-4">
                {/* Album Art with Animation */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                        {songs[currentIndex]?.spotifyData?.track?.album?.images?.[0] ? (
                            <img
                                src={songs[currentIndex].spotifyData.track.album.images[0].url}
                                alt="Album art"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            '🎹'
                        )}
                    </div>
                    {/* Pulse ring for currently playing */}
                    {isPlaying && (
                        <div className="absolute inset-0 rounded-xl animate-pulse"></div>
                    )}
                    {/* Live indicator */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                        <span className="block truncate sm:whitespace-normal sm:break-words">
                            {songs[currentIndex]?.spotifyData?.track?.name || 'No song selected'}
                        </span>
                    </h2>
                    <p className="text-purple-600 font-medium text-sm sm:text-base">
                        <span className="block truncate sm:whitespace-normal sm:break-words">
                            {songs[currentIndex]?.spotifyData?.track?.artists?.[0]?.name || 'Unknown artist'}
                        </span>
                    </p>
                    {/* Sync indicator */}
                    {/* <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                            <span className="text-xs text-gray-500">
                                {isSynced ? 'Synced' : 'Syncing...'}
                            </span>
                        </div> */}
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
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>
        </section>
    );
}   
