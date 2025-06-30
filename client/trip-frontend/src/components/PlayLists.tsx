import React, {useEffect, useState} from "react";
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";
import {useSearchParams} from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-node";
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";
import { useAuth } from "../spotify/SpotifyUseAuth.ts";
import { PlaylistProps, SearchResult, SearchResponse } from "../types/index.ts";
import axios from "axios";

const spotifyApi = new SpotifyWebApi();
const serverURL = import.meta.env.VITE_SERVER_URL;

const PlayLists: React.FC<PlaylistProps> = ({handleAddToQueue}) => {
    const { authCode, accessToken } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [userID, setUserID] = useState("");
    const [trackIDs, setTrackIDs] = useState<string[][]>([]);
    const [selectedTrack, setSelectedTrack] = useState<string>("");
    const [songItems, setSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectedSongItems, setSelectedSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    
    // Search functionality
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [sortBy, setSortBy] = useState<string>('date'); // default to Most Recent

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
        console.log(selectedSongItems.forEach((x) => console.log(x.track.name)))
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

    // Search functionality
    const handleSearch = async (sortOverride?: string) => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.post<SearchResponse>(`${serverURL}/search-songs`, {
                query: searchQuery,
                maxResults: 10,
                sortBy: sortOverride || sortBy
            });
            setSearchResults(response.data.results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search failed:', error);
            window.dispatchEvent(new CustomEvent('modalError', {
                detail: { message: 'Failed to search for songs. Please try again.' }
            }));
        } finally {
            setIsSearching(false);
        }
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        // Re-trigger search with new sort if there is a query
        if (searchQuery.trim()) {
            handleSearch(newSort);
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAddSearchResult = (searchResult: SearchResult) => {
        // Convert search result to a format compatible with SpotifyApi.PlaylistTrackObject
        const mockSpotifyTrack: SpotifyApi.PlaylistTrackObject = {
            added_at: new Date().toISOString(),
            added_by: null,
            is_local: false,
            track: {
                id: searchResult.id,
                name: searchResult.title,
                artists: [{ id: '', name: searchResult.uploader }],
                album: { id: '', name: '', images: [] },
                duration_ms: searchResult.duration * 1000,
                explicit: false,
                external_ids: {},
                external_urls: { spotify: searchResult.webpage_url },
                href: searchResult.webpage_url,
                is_local: false,
                is_playable: true,
                linked_from: null,
                popularity: 0,
                preview_url: null,
                restrictions: null,
                type: 'track',
                uri: searchResult.webpage_url
            } as any
        };

        handleAddToQueue([mockSpotifyTrack]);
        setShowSearchResults(false);
        setSearchQuery("");
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 border-r flex flex-col">
            {authCode ? (
                <>
                    <div>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    placeholder="Search for songs..."
                                    className="w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={isSearching}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {isSearching ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                        <i className="fas fa-search"></i>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="mb-2 flex items-center justify-end">
                            <label htmlFor="sort-dropdown" className="mr-2 text-xs text-gray-600">Sort by:</label>
                            <select
                                id="sort-dropdown"
                                value={sortBy}
                                onChange={handleSortChange}
                                className="p-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="date">Most Recent</option>
                                <option value="views">Most Listened</option>
                                <option value="alphabetic">A-Z</option>
                            </select>
                        </div>

                        {/* Search Results */}
                        {showSearchResults && searchResults.length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Empty search results? Let's write a new hit together! Try narrowing your search.
                            </div>
                        )}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="mb-4 bg-white rounded-lg shadow-sm border">
                                <div className="p-3 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={result.id}
                                            className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleAddSearchResult(result)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-medium text-gray-900 break-words whitespace-normal">
                                                        {result.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {result.uploader}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatDuration(result.duration)}
                                                    </p>
                                                </div>
                                                <button
                                                    className="flex-shrink-0 text-blue-500 hover:text-blue-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddSearchResult(result);
                                                    }}
                                                >
                                                    <i className="fas fa-plus text-base"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
