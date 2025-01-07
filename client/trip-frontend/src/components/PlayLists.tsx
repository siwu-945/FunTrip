import React, {useEffect, useState} from "react";
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";
import {useNavigate, useSearchParams} from 'react-router-dom';
import SpotifyWebApi from 'spotify-web-api-node'
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";

var spotifyApi = new SpotifyWebApi();

interface PlaylistProps {
    handleAddToQueue: (tracks: SpotifyApi.PlaylistTrackObject[]) => void; // Function that takes an array of strings and returns nothing (void)
}

const PlayLists: React.FC<PlaylistProps> = ({handleAddToQueue}) => {
    const [searchParams] = useSearchParams();
    const [showDropdown, setShowDropdown] = useState(false);
    const [userID, setUserID] = useState("")
    const [trackIDs, setTrackIDs] = useState<string[][]>([]);
    const [authCode, setAuthCode] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<string>("");
    const [songItems, setSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectedSongItems, setSelectedSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // set authorization code
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setAuthCode(code);
        } else {  
            window.dispatchEvent(new CustomEvent('modalError', {
                detail: { message: "Invalid authorization code. Please log in again." }
            }));
        }
    }, [searchParams]);
    // access token
    useEffect(() => {
        if (!accessToken) {
            window.dispatchEvent(new CustomEvent('modalError', {
                detail: { message: "Access token not found. Please re-authenticate." }
            }));
            return;
        }
        spotifyApi.setAccessToken(accessToken);
    }, [accessToken]);

    //get the account info from the access token
    useEffect(() => {
        if (!accessToken) return;
        spotifyApi.getMe().then(data => {
            console.log(data.body)
            setUserID(data.body.id);
        }).catch((error) => {
            // slient warning
            const errorMessage = error?.message || "Failed to fetch user account information.";
            console.warn(errorMessage);
        });
    }, [accessToken]);
    //return the playlists user have
    useEffect(() => {
        if (!userID && !accessToken) return;
        spotifyApi.getUserPlaylists(userID)
            .then((data) => {
                const trackData = data.body.items;
                const newTrackIds = trackData.map((track) => [track.id, track.name]);
                setTrackIDs(newTrackIds);
            }).catch((error) => {
                const errorMessage = error?.message || "Error retrieving playlists. Try again later.";
                
                window.dispatchEvent(new CustomEvent('modalError', {
                    detail: { message: errorMessage }
                }));
            });
    }, [userID]);
    

    useEffect(() => {
        setSelectedSongItems([]);
    }, [selectedTrack]);
    
    const getSpotifyAuthCode = () => {
        window.location.href = getSpotifyAuthURL();
    };

    const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const playlistID = event.target.value;
        setSelectedTrack(playlistID);
        if (playlistID) {
            spotifyApi.getPlaylist(playlistID).then((data => {
                setSongItems(data.body.tracks.items);
            })).catch(() => {
                // slient warning
                console.warn("Failed to retrieve playlist. Please try again.");
            });
        }
    };
    
    const RetrievePlaylist = async () => {
        if (!authCode) {
            window.dispatchEvent(new CustomEvent('modalError', {
                detail: { message: "Authorization code missing. Please log in again." }
            }));
            return;
        }
        const token = await SpotifyAuthCode(authCode);
        if (token) {
            setAccessToken(token);
            setShowDropdown(true);
            console.log("got access. token" + token);
        } else {
            window.dispatchEvent(new CustomEvent('modalError', {
                detail: { message: "Failed to retrieve access token. Try logging in again." }
            }));
        }
    };

    const handleAddSongs = () => {
        handleAddToQueue(selectedSongItems);
        setSelectedSongItems([]);
    };


    const handleCheckboxChange = (trackInfo: SpotifyApi.PlaylistTrackObject) => {
        const trackName = trackInfo.track?.name || ""; // Get track name
        const trackArtists = trackInfo.track?.artists.map(artist => artist.name).join(", ") || ""; // Get artists

        setSelectedSongItems((prev) => {
            const isAlreadySelected = prev.some(
                (item) =>
                    item.track?.name === trackName &&
                    item.track?.artists.map(artist => artist.name).join(", ") === trackArtists
            );

            // Add or remove the track based on its existence
            if (isAlreadySelected) {
                return prev.filter(
                    (item) =>
                        item.track?.name !== trackName ||
                        item.track?.artists.map(artist => artist.name).join(", ") !== trackArtists
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
    
    function checkIfSongAlreadyAdded(songName : string) : boolean {
        return selectedSongItems.some(item => item.track?.name === songName);
    }


    // TODO set refresh token
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
                                    onClick={getSpotifyAuthCode}
                                ></i>
                                <i className="fas fa-plus text-gray-600 hover:text-green-500 hover:scale-110 transition duration-200"
                                   title="Add"
                                   onClick={getSpotifyAuthCode}
                                ></i>
                            </div>
                        </div>

                        {showDropdown &&
                            <div className="p-4">
                                <label htmlFor="playlist-dropdown"
                                       className="block text-lg font-medium text-gray-700 mb-2">
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
                        }
                        <div className="flex items-center justify-center">
                            {!showDropdown && (
                                <button
                                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                                    onClick={RetrievePlaylist}
                                >
                                    Retrieve Your Playlist
                                </button>
                            )}
                        </div>
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
                                    <a
                                        className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded"
                                    >
                                        {obj.track?.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {showDropdown &&
                        <div className="pt-4 border-t flex space-x-2">
                            <button
                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                                onClick={handleAddSongs}
                            >
                                Add Song
                            </button>
                        </div>
                    }
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <button
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        onClick={getSpotifyAuthCode}
                    >
                        Login
                    </button>
                </div>
            )}
        </aside>
    );
};

export default PlayLists;
