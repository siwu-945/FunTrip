import React, { useEffect, useState } from "react";
import { getSpotifyAuthURL } from "../tools/spotifyAuth.ts";
import SpotifyWebApi from "spotify-web-api-node";
import { useAuth } from "../spotify/SpotifyUseAuth.ts";
import { PlaylistProps, SearchResult, SearchResponse, SongObj } from "../types/index.ts";
import axios from "axios";

const spotifyApi = new SpotifyWebApi();
const serverURL = import.meta.env.VITE_SERVER_URL;

const PlayLists: React.FC<PlaylistProps> = ({ handleAddToQueue, isOpen, onClose, roomId, saveCurrentUserSession}) => {
    const { authCode, accessToken } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [userID, setUserID] = useState("");
    const [trackIDs, setTrackIDs] = useState<string[][]>([]);
    const [selectedTrack, setSelectedTrack] = useState<string>("");
    const [songItems, setSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectedSongItems, setSelectedSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle modal open/close
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedTrack("");
            setSongItems([]);
            setSelectedSongItems([]);
            setSelectAll(false);
        }
    }, [isOpen]);

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
        if (!userID || !accessToken) return;
        spotifyApi.getUserPlaylists(userID)
            .then((data) => {
                const trackData = data.body.items;
                const newTrackIds = trackData.map((track) => [track.id, track.name]);
                setTrackIDs(newTrackIds);
                setShowDropdown(true); // Show the playlist dropdown after login
            }).catch((error) => {
                const errorMessage = error?.message || "Error retrieving playlists. Try again later.";
                window.dispatchEvent(new CustomEvent('modalError', {
                    detail: { message: errorMessage }
                }));
            });
    }, [userID, accessToken]);

    useEffect(() => {
        setSelectedSongItems([]);
        setSelectAll(false);
    }, [selectedTrack]);

    if (!isOpen) return null;

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
        onClose()
        setSelectedSongItems([]);
        setSelectAll(false);
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

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    function handleSpotifyLogin(): void {
        window.location.href = getSpotifyAuthURL()
        saveCurrentUserSession()
    }

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
            onClick={onClose}
        />
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out scale-100 opacity-100">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <i className="fab fa-spotify"></i>
                    Add from Spotify Playlist
                </h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 transition-colors duration-200 hover:bg-opacity-30"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {authCode && accessToken ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <span className="font-semibold text-2xl text-gray-700">Your Songs</span>
                            </div>
                            <div className="flex space-x-4">
                                {/* Spotify Login Button */}
                                <i
                                    className="fas fa-sign-in-alt text-gray-600 hover:text-blue-500 hover:scale-110 transition duration-200 cursor-pointer"
                                    title="Login to Spotify"
                                    onClick={handleSpotifyLogin}
                                ></i>
                                {/* Add Button */}
                                <i
                                    className="fas fa-plus text-gray-600 hover:text-green-500 hover:scale-110 transition duration-200 cursor-pointer"
                                    title="Add Playlist"
                                ></i>
                            </div>
                        </div>
                  
                        {/* Playlist Selection */}
                        {showDropdown && (
                            <div>
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
                                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
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

                        {/* Song List */}
                        {songItems.length > 0 && (
                            <div className="space-y-4">
                                {/* Select All */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        {selectedSongItems.length} of {songItems.length} selected
                                    </span>
                                </div>

                                {/* Songs List */}
                                <div className="max-h-64 overflow-y-auto border rounded-lg">
                                    {songItems.map((obj, idx) => (
                                        <div key={idx} className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b last:border-b-0">
                                            <input
                                                type="checkbox"
                                                checked={checkIfSongAlreadyAdded(obj.track?.name || "")}
                                                onChange={() => handleCheckboxChange(obj)}
                                                className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {obj.track?.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {obj.track?.artists.map((artist) => artist.name).join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSongs}
                                        disabled={selectedSongItems.length === 0}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        Add {selectedSongItems.length} Songs
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* No playlist selected */}
                        {!selectedTrack && showDropdown && (
                            <div className="text-center py-8">
                                <i className="fab fa-spotify text-5xl text-green-500 mb-4"></i>
                                <p className="text-gray-600 text-lg">Select a playlist to view songs</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Login Required */
                    <div className="text-center py-8">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <i className="fab fa-spotify text-white text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Connect to Spotify</h3>
                        <p className="text-gray-600 mb-8 text-lg">Login to access your Spotify playlists</p>

                        <button
                            onClick={handleSpotifyLogin}
                            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
                        >
                            <i className="fab fa-spotify text-xl"></i>
                            Login with Spotify
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default PlayLists;
