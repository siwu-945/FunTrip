import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import {SongRequest} from "../components/SongRequest.tsx";
import {SpotifyTest} from "../spotify/SpotifyTest.tsx";
import {SpotifyLogin} from "../spotify/SpotifyLogin.tsx";
import Sidebar from "../components/SideBar.tsx";
import TextInput from "../components/TextInput.tsx";
import PlayLists from "../components/PlayLists.tsx";


export const Home = () => {
    const navigate = useNavigate();
    const { socket, connected } = useSocket();

    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    return (
        <div className="">
            {/*<h1>Connection status: {connected ? 'Welcome!' : 'Disconnected'}</h1>*/}
            {/*<SongRequest socket={socket}/>*/}
            {/*<SpotifyTest />*/}
            <div className="w-screen flex h-screen">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-between">
                    {/* Main area above the search bar */}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Main Content</h1>
                    </div>

                    <div className="flex justify-center pb-4 px-4">
                        <div className="w-full">
                            <TextInput />
                        </div>
                    </div>
                </div>
                <PlayLists />

            </div>
            );
            {/*<SpotifyLogin code={code}/>*/}
        </div>
    );
};