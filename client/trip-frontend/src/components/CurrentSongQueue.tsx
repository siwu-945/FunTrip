import React from 'react';

// TODO update the song names with actual added songs
const CurrentSongQueue: React.FC = () => {
    // Hardcoded list of song names
    const songQueue = ["Song 1", "Song 2", "Song 3", "Song 4", "Song 5", "Song 1", "Song 2", "Song 3", "Song 4", "Song 5"];

    return (
        <div className="bg-gray-100 rounded-md mt-2 w-2/3 max-h-64 flex flex-col">
            <div className="bg-gray-200 p-4 rounded-t-md">
                <h2 className="text-xl font-semibold">Current Song Queue</h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {songQueue.map((song, index) => (
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
