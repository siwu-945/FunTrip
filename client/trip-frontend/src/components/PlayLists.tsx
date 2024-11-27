import React, {useEffect, useState} from "react";
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";
import { useNavigate, useSearchParams } from 'react-router-dom';
import SpotifyWebApi from 'spotify-web-api-node'
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";

var spotifyApi = new SpotifyWebApi();

const PlayLists: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [authCode, setAuthCode] = useState('');
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setAuthCode(code);
        } else {
            console.log('No code found');
        }
    }, [searchParams]);

    useEffect(() =>{
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    const sections = [
        {
            links: [
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
                "User 1", "User 2",
            ],
        },

    ];

    const getSpotifyAuthCode = () => {
        window.location.href = getSpotifyAuthURL();
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
                    <span className="font-semibold text-2xl text-gray-700">Song Queue</span>
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

            {/* Scrollable Nav */}
            <nav className="flex-1 overflow-y-auto">
                <ul>
                    {sections.map((section, idx) => (
                        <React.Fragment key={idx}>
                            {section.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                    <a
                                        href="#"
                                        className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </React.Fragment>
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
                    onClick={handleAddSong}
                >
                    Add Song
                </button>
            </div>
        </aside>
    );
};

export default PlayLists;
