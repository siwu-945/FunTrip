import React from 'react';
import { SongObj } from '../types';
import './CurrentSongQueue.css';

interface CurrentSongQueueProps {
    songs: SongObj[];
    currentSongIndex: number;
    isHost: boolean;
    onClearQueue: () => void;
}

// TODO update the song names with actual added songs
const CurrentSongQueue: React.FC<CurrentSongQueueProps> = ({ songs, currentSongIndex, isHost, onClearQueue }) => {

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-full flex flex-col h-[60vh]">
            <div className="bg-gray-100 p-4 rounded-t-md">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-center flex-1">Current Song Queue</h2>
                    {isHost && songs.length > 0 && (
                        <button
                            onClick={() => {
                                console.log("Current song stream before clearing:", {
                                    songsCount: songs.length,
                                    songs: songs.map(s => s.spotifyData.track?.name),
                                    currentSongIndex
                                });
                                onClearQueue();
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                        >
                            <i className="fas fa-trash text-xs"></i>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {songs.map((song, index) => (
                        <li
                            key={index}
                            // highlight the current song
                            className={`text-gray-700 py-1 px-2 rounded shadow-sm transition-all duration-200 ${
                                index === currentSongIndex 
                                    ? 'current-song-playing' 
                                    : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                            {index + 1}. {song.spotifyData.track?.name || ""}
                            {index === currentSongIndex && (
                                <span className="ml-2 text-green-600">
                                    <i className="fas fa-play"></i>
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
                {songs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <i className="fas fa-music text-2xl mb-2"></i>
                        <p className="text-sm">Add some songs to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentSongQueue;
