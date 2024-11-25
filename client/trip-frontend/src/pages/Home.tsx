import { useNavigate } from 'react-router-dom';
import { getSpotifyAuthURL } from '../tools/spotifyAuth';
import { useSocket } from '../hooks/useSocket';
import {SongRequest} from "../components/SongRequest.tsx";


export const Home = () => {
    const navigate = useNavigate();
    const { socket, connected } = useSocket();

    const handleSpotifyLogin = () => {
        window.location.href = getSpotifyAuthURL();
    };

    return (
        <div className="home-container">
            <h1>Connection status: {connected ? 'Welcome!' : 'Disconnected'}</h1>
            <SongRequest socket={socket}/>
            <button
                className="secondary-button"
                onClick={handleSpotifyLogin}>
                Login With Spotify
            </button>
        </div>
    );
};