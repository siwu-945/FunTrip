import React from 'react';

interface SongQueueProps {
    songs: string[]; // Function that takes an array of strings and returns nothing (void)
}
// TODO update the song names with actual added songs
const CurrentSongQueue: React.FC<SongQueueProps>= ( {songs}) => {
    // Hardcoded list of song names

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-2/3 max-h-64 flex flex-col">
            <div className="bg-gray-200 p-4 rounded-t-md">
                <h2 className="text-xl font-semibold">Current Song Queue</h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {songs.map((song, index) => (
                        <li key={index} className="text-gray-700">
                            {index + 1}. {song}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CurrentSongQueue;
