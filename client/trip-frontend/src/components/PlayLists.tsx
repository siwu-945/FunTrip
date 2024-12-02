import React, {useEffect, useState} from "react";
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";
import {useNavigate, useSearchParams} from 'react-router-dom';
import SpotifyWebApi from 'spotify-web-api-node'
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";

var spotifyApi = new SpotifyWebApi();

const PlayLists: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [userID, setUserID] = useState("")
    const [trackIDs, setTrackIDs] = useState<string[][]>([]);
    const [authCode, setAuthCode] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<string>("");


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
                console.log(trackData[0]);
                const newTrackIds = trackData.map((track) => [track.id, track.name])
                console.log('Retrieved playlists', newTrackIds);
                setTrackIDs(newTrackIds)
            }).catch((err) => {
            console.log("play list error:" + err)
        });
    }, [userID])

    const getSpotifyAuthCode = () => {
        window.location.href = getSpotifyAuthURL();
    };

    const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTrack(event.target.value);
        console.log("Selected track:", event.target.value);
    };

    const handleAddSong = async () => {
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

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 border-r flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="font-semibold text-2xl text-gray-700">Your songs</span>
                </div>
                <div className="flex space-x-4">
                    <i
                        className="fas fa-sign-in-alt text-gray-600 hover:text-blue-500 hover:scale-110 transition duration-200"
                        title="Login"
                        onClick={getSpotifyAuthCode}>
                    </i>
                    <i className="fas fa-plus text-gray-600" title="Add"></i>
                </div>
            </div>

            {/*TODO save this for user songs ul*/}
            {/* Scrollable Nav */}
            {/*<nav className="flex-1 overflow-y-auto">*/}
            {/*    <ul>*/}
            {/*        {trackIDs.map((section, idx) => (*/}
            {/*            <React.Fragment key={idx}>*/}
            {/*                {section.map((trackName, linkIdx) => (*/}
            {/*                    <li key={linkIdx}>*/}
            {/*                        <a*/}
            {/*                            href="#"*/}
            {/*                            className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded"*/}
            {/*                        >*/}
            {/*                            {trackName}*/}
            {/*                        </a>*/}
            {/*                    </li>*/}
            {/*                ))}*/}
            {/*            </React.Fragment>*/}
            {/*        ))}*/}
            {/*    </ul>*/}
            {/*</nav>*/}
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
                        <option key={id} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

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
                    onClick={handleAddSong}
                >
                    Add Song
                </button>
            </div>
        </aside>
    );
};

export default PlayLists;
