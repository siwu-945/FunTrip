import { useNavigate } from 'react-router-dom';
import { getSpotifyAuthURL } from '../tools/spotifyAuth';
import { useSocket } from '../hooks/useSocket';
import {SongRequest} from "../components/SongRequest.tsx";
import {SpotifyTest} from "../spotify/SpotifyTest.tsx";


export const Home = () => {
    const navigate = useNavigate();
    const { socket, connected } = useSocket();

    return (
        <div className="home-container">
            <h1>Connection status: {connected ? 'Welcome!' : 'Disconnected'}</h1>
            <SongRequest socket={socket}/>
            <SpotifyTest />
        </div>
    );
};