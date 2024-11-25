import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSpotifyAuthURL } from '../tools/spotifyAuth.ts';

const serverURL = import.meta.env.VITE_SERVER_URL;

export const SpotifyTest = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [authCode, setAuthCode] = useState('');
    const [response, setResponse] = useState('');

    // Retrieve the authorization code from the URL query parameters
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setAuthCode(code); // Store the code in state
        } else {
            console.log('No code found');
        }
    }, [searchParams]);

    // Redirect user to Spotify authorization page
    const getAuthCode = async () => {
        window.location.href = getSpotifyAuthURL();
    };

    // Test Spotify API by sending the authorization code to the server
    const testSpotifyAPI = async () => {
        if (!authCode) {
            console.log('No code available. Please authenticate first.');
            return;
        }

        try {
            console.log('Testing Spotify API with code:', authCode);
            const loginUrl = `${serverURL}/api/spotify/login`;
            const res = await axios.post(loginUrl, { code: authCode });
            setResponse(JSON.stringify(res.data, null, 2)); // Store response data
            console.log(res.data);
        } catch (error) {
            console.error('Error testing Spotify API:', error);
        }
    };

    return (
        <div>
            <button onClick={getAuthCode}>Authenticate with Spotify</button>
            <button onClick={testSpotifyAPI} disabled={!authCode}>
                Test Spotify API
            </button>
            {response && (
                <pre>
                    <strong>API Response:</strong>
                    {response}
                </pre>
            )}
        </div>
    );
};
