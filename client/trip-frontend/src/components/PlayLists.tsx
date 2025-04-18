import React, {useEffect, useState} from "react";
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";
import {useSearchParams} from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-node";
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";
import { useAuth } from "../spotify/SpotifyUseAuth.ts";
import { PlaylistProps } from "../types/index.ts";

const spotifyApi = new SpotifyWebApi();

const PlayLists: React.FC<PlaylistProps> = ({handleAddToQueue}) => {
    const { authCode, accessToken } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [userID, setUserID] = useState("");
    const [trackIDs, setTrackIDs] = useState<string[][]>([]);
    const [selectedTrack, setSelectedTrack] = useState<string>("");
    const [songItems, setSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectedSongItems, setSelectedSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // get the account info from the access token
    useEffect(() => {
        if (!accessToken) return;
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.getMe().then((data) => {
            setUserID(data.body.id);
        }).catch((error) => {
            const errorMessage = error?.message || "Failed to fetch user account information.";
            console.warn(errorMessage);
        });
    }, [accessToken]);

    // return the playlists user have
    useEffect(() => {
        if (!userID && !accessToken) return;
        spotifyApi.getUserPlaylists(userID)
            .then((data) => {
                const trackData = data.body.items;
                const newTrackIds = trackData.map((track) => [track.id, track.name]);
                setTrackIDs(newTrackIds);
                setShowDropdown(true); // Show the playlist dropdown after login
            }).catch((error) => {
            const errorMessage = error?.message || "Error retrieving playlists. Try again later.";
            window.dispatchEvent(new CustomEvent('modalError', {
                detail: {message: errorMessage}
            }));
        });
    }, [userID, accessToken]);

    useEffect(() => {
        setSelectedSongItems([]);
    }, [selectedTrack]);

    // Fetch songs in the selected playlist
    const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const playlistID = event.target.value;
        setSelectedTrack(playlistID);
        if (playlistID) {
            spotifyApi.getPlaylist(playlistID).then((data) => {
                setSongItems(data.body.tracks.items);
            }).catch(() => {
                // silent warning
                console.warn("Failed to retrieve playlist. Please try again.");
            });
        }
    };

    const handleAddSongs = () => {
        handleAddToQueue(selectedSongItems);
        setSelectedSongItems([]);
    };

    const handleCheckboxChange = (trackInfo: SpotifyApi.PlaylistTrackObject) => {
        const trackName = trackInfo.track?.name || "";
        const trackArtists = trackInfo.track?.artists.map((artist) => artist.name).join(", ") || "";

        setSelectedSongItems((prev) => {
            const isAlreadySelected = prev.some(
                (item) =>
                    item.track?.name === trackName &&
                    item.track?.artists.map((artist) => artist.name).join(", ") === trackArtists
            );

            if (isAlreadySelected) {
                return prev.filter(
                    (item) =>
                        item.track?.name !== trackName ||
                        item.track?.artists.map((artist) => artist.name).join(", ") !== trackArtists
                );
            } else {
                return [...prev, trackInfo];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedSongItems([]);
        } else {
            setSelectedSongItems([...songItems]);
        }
        setSelectAll(!selectAll);
    };

    function checkIfSongAlreadyAdded(songName: string): boolean {
        return selectedSongItems.some((item) => item.track?.name === songName);
    }

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 border-r flex flex-col">
            {authCode ? (
                <>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <span className="font-semibold text-2xl text-gray-700">Your Songs</span>
                            </div>
                            <div className="flex space-x-4">
                                <i
                                    className="fas fa-sign-in-alt text-gray-600 hover:text-blue-500 hover:scale-110 transition duration-200"
                                    title="Login"
                                    onClick={() => window.location.href = getSpotifyAuthURL()}
                                ></i>
                                <i
                                    className="fas fa-plus text-gray-600 hover:text-green-500 hover:scale-110 transition duration-200"
                                    title="Add"></i>
                            </div>
                        </div>

                        {showDropdown && (
                            <div className="p-4">
                                <label
                                    htmlFor="playlist-dropdown"
                                    className="block text-lg font-medium text-gray-700 mb-2"
                                >
                                    Select a Playlist
                                </label>
                                <select
                                    id="playlist-dropdown"
                                    value={selectedTrack}
                                    onChange={handleSelectionChange}
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="" disabled>
                                        -- Select a Playlist --
                                    </option>
                                    {trackIDs.map(([id, name]) => (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <nav className="flex-1 overflow-y-auto">
                        {songItems.length > 0 && (
                            <div className="p-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Select All</span>
                                </label>
                            </div>
                        )}
                        <ul>
                            {songItems.map((obj, idx) => (
                                <li key={idx} className="flex items-center space-x-2 py-2 px-4">
                                    <input
                                        type="checkbox"
                                        checked={checkIfSongAlreadyAdded(obj.track?.name || "")}
                                        onChange={() => handleCheckboxChange(obj)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <a className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded">
                                        {obj.track?.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {showDropdown && (
                        <div className="p-4">
                            <button
                                onClick={handleAddSongs}
                                className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Add Songs
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-4 text-center">
                    <button
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        onClick={() => window.location.href = getSpotifyAuthURL()}
                    >
                        Login
                    </button>
                </div>
            )}
        </aside>
    );
};

export default PlayLists;
