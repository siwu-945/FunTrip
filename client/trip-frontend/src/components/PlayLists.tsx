import React, {useEffect, useState} from "react";
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";
import {useNavigate, useSearchParams} from 'react-router-dom';
import SpotifyWebApi from 'spotify-web-api-node'
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";

var spotifyApi = new SpotifyWebApi();
interface PlaylistProps {
    handleAddToQueue: (tracks: string[]) => void; // Function that takes an array of strings and returns nothing (void)
}

const PlayLists: React.FC<PlaylistProps>= ( {handleAddToQueue}) => {
    const [searchParams] = useSearchParams();
    const [userID, setUserID] = useState("")
    const [trackIDs, setTrackIDs] = useState<string[][]>([]);
    const [authCode, setAuthCode] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<string>("");
    const [songItems, setSongItems] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [selectedSongItems, setSelectedSongItems] = useState<string[]>([]);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setAuthCode(code);
        } else {
            console.log('No code found');
        }
    }, [searchParams]);

    useEffect(() => {
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    //get the account info from the access token
    useEffect(() => {
        if (!accessToken) return
        spotifyApi.getMe().then(data => {
            console.log(data.body)
            setUserID(data.body.id)
        }).catch((err) => {
            console.log(err)
        })
    }, [accessToken])

    //return the playlists user have
    useEffect(() => {
        if (!userID && !accessToken) return
        spotifyApi.getUserPlaylists(userID)
            .then((data) => {
                const trackData = data.body.items;
                const newTrackIds = trackData.map((track) => [track.id, track.name])
                // console.log('Retrieved playlists', newTrackIds);
                setTrackIDs(newTrackIds)
            }).catch((err) => {
            console.log("play list error:" + err)
        });
    }, [userID])

    useEffect(() => {
        setSelectedSongItems([]);
    }, [selectedTrack]);

    const getSpotifyAuthCode = () => {
        window.location.href = getSpotifyAuthURL();
    };

    const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const playlistID = event.target.value;
        setSelectedTrack(playlistID);
        if(playlistID){
            spotifyApi.getPlaylist(playlistID).then((data => {
                setSongItems(data.body.tracks.items);
            }))
        }
    };

    const RetrievePlaylist = async () => {
        if (!authCode) {
            console.log("No authorization code. Please login first.");
            return;
        }
        const token = await SpotifyAuthCode(authCode);
        if (token) {
            setAccessToken(token);
            console.log("got access. token" + token);
        } else {
            console.log("Failed to retrieve access token.");
        }
    }

    const handleAddSongs = () => {
        handleAddToQueue(selectedSongItems);
        setSelectedSongItems([]);
    };


    const handleCheckboxChange = (trackName: string) => {
        // TODO don't add songs not only have the same name, but same singer
        setSelectedSongItems((prev) =>
            prev.includes(trackName)
                ? prev.filter((name) => name !== trackName)
                : [...prev, trackName]
        );
    };

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 border-r flex flex-col">
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
                           title="Add"></i>
                    </div>
                </div>

                <div className="p-4">
                    <label htmlFor="playlist-dropdown" className="block text-lg font-medium text-gray-700 mb-2">
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
            </div>
            <nav className="flex-1 overflow-y-auto">
                <ul>
                    {songItems.map((obj, idx) => (
                        <li key={idx} className="flex items-center space-x-2 py-2 px-4">
                            <input
                                type="checkbox"
                                checked={selectedSongItems.includes(obj.track?.name || "")}
                                onChange={() => handleCheckboxChange(obj.track?.name || "")}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <a
                                // href="#"
                                className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded"
                            >
                                {obj.track?.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Fixed Buttons */}
            {/*TODO can only display one button, so user login, login button disappear, the only button they can use is add song
               TODO if user not logged in, add song button is not there, can ony add song after log in
             */}
            <div className="pt-4 border-t flex space-x-2">
                <button
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                    onClick={getSpotifyAuthCode}
                >
                    Login
                </button>
                <button
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                    onClick={RetrievePlaylist}
                >
                    Retrieve
                </button>
                <button
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                    onClick={handleAddSongs}
                >
                    Add Song
                </button>
            </div>

        </aside>
    );
};

export default PlayLists;
