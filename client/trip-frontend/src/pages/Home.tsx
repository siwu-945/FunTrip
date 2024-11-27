import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import {SongRequest} from "../components/SongRequest.tsx";
import {SpotifyTest} from "../spotify/SpotifyTest.tsx";
import {SpotifyLogin} from "../spotify/SpotifyLogin.tsx";
import Sidebar from "../components/SideBar.tsx";


export const Home = () => {
    const navigate = useNavigate();
    const { socket, connected } = useSocket();

    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    return (
        <div className="home-container">
            {/*<h1>Connection status: {connected ? 'Welcome!' : 'Disconnected'}</h1>*/}
            <SongRequest socket={socket}/>
            <SpotifyTest />
            <Sidebar />
            {/*<SpotifyLogin code={code}/>*/}
        </div>
    );
};