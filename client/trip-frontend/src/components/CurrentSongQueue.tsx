import React from 'react';
import { SongObj } from '../types';
import './CurrentSongQueue.css';

interface CurrentSongQueueProps {
    songs: SongObj[];
    currentSongIndex: number;
}

// TODO update the song names with actual added songs
const CurrentSongQueue: React.FC<CurrentSongQueueProps> = ({ songs, currentSongIndex }) => {

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-full flex flex-col h-[60vh]">
            <div className="bg-gray-100 p-4 rounded-t-md">
                <h2 className="text-lg font-semibold mb-2 text-center">Current Song Queue</h2>
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
            </div>
        </div>
    );
};

export default CurrentSongQueue;
