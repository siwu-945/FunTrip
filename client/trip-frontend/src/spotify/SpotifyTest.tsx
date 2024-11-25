import {useEffect, useState} from 'react';
import axios from "axios";
import {useNavigate, useSearchParams} from 'react-router-dom';
import {getSpotifyAuthURL} from "../tools/spotifyAuth.ts";

const serverURL = import.meta.env.VITE_SERVER_URL;

export const SpotifyTest = ( ) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            handleSpotifyCode(code);
        } else {
            // Handle error
            navigate('/');
        }
    }, [searchParams]);

    const getAuthCode = async () => {
        window.location.href = getSpotifyAuthURL();
    }

    const testSpotifyAPI = async () => {
        try {
            const loginUrl = serverURL + '/api/spotify/login';
            axios.post(loginUrl, {
                code
            }).then(res =>{
                console.log(res);
            })

        } catch (error) {
            setTestResult('Error: ' + error);
        }
    };

    return (
        <div>
            <button onClick={getAuthCode}>Test Spotify API</button>
            {testResult && <p>Result: {testResult}</p>}
        </div>
    );
};