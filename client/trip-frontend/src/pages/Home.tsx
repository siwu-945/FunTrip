import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import {SongRequest} from "../components/SongRequest.tsx";
import {SpotifyTest} from "../spotify/SpotifyTest.tsx";
import {SpotifyLogin} from "../spotify/SpotifyLogin.tsx";
import Sidebar from "../components/SideBar.tsx";
import TextInput from "../components/TextInput.tsx";
import PlayLists from "../components/PlayLists.tsx";
import CurrentSongQueue from "../components/CurrentSongQueue.tsx";
import { useState, useEffect } from "react";
import AudioPlayer from "../components/AudioPlayer.tsx";
import Modal from "../components/Modal";
import {SpotifyAuthCode} from "../spotify/SpotifyAuthCode.ts";
import SpotifyWebApi from "spotify-web-api-node";
import currentSongQueue from "../components/CurrentSongQueue.tsx";


var spotifyApi = new SpotifyWebApi();

export const Home = () => {
    const [currentQueue, setCurrentQueue] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [authCode, setAuthCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const { socket, connected } = useSocket();
    const [searchParams] = useSearchParams();
    const { accessToken, errorMsg } = SpotifyAuthCode(authCode);

    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        setCurrentQueue((prev) => [...prev, ...selectedTracks]);
    };
    const triggerError = (message: string) => {
        setError(message);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };
    // event listener for modal event from PlayLists
    useEffect(() => {
        const handleModalError = (event: Event) => {
            const customEvent = event as CustomEvent;
            triggerError(customEvent.detail.message);
        };
    
        window.addEventListener('modalError', handleModalError);
    
        return () => {
            window.removeEventListener('modalError', handleModalError);
        };
    }, []);

    // set authorization code
    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            setAuthCode(code);
        }

    }, [searchParams]);
    // access token
    useEffect(() => {
        if (!accessToken) return;

        spotifyApi.setAccessToken(accessToken);
    }, [accessToken]);
    

    return (
        <div className="">
            {/*<h1>Connection status: {connected ? 'Welcome!' : 'Disconnected'}</h1>*/}
            {/*<SongRequest socket={socket}/>*/}
            {/*<SpotifyTest />*/}
            <div className="w-screen flex h-screen">
                <Sidebar/>
                <div className="flex-1 flex flex-col justify-between">
                    {/* Main area above the search bar */}
                    <div className="p-6">
                        {/* Room name and Current Song Queue */}
                        <h1 className="text-2xl font-bold mb-2">Room name</h1>
                        <AudioPlayer songs={currentQueue}/>
                        <CurrentSongQueue songs={currentQueue}/>
                    </div>

                    {/* Text Input at the bottom */}
                    <div className="flex justify-center pb-4 px-4">
                        <div className="w-full">
                            <TextInput/>
                        </div>
                    </div>
                </div>
                <PlayLists handleAddToQueue={handleAddToQueue} accessToken={accessToken} spotifyApi={spotifyApi} authCode={authCode} />

            </div>

            {/* TODO Update Modal for more Error Messages */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                message={error || "An unknown error occurred."}
            />
        </div>
    );
};