import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import {SongRequest} from "../components/SongRequest.tsx";
import {SpotifyTest} from "../spotify/SpotifyTest.tsx";
import {SpotifyLogin} from "../spotify/SpotifyLogin.tsx";
import { SpotifyAuthCode } from '../spotify/SpotifyAuthCode';
import Sidebar from "../components/SideBar.tsx";
import TextInput from "../components/TextInput.tsx";
import PlayLists from "../components/PlayLists.tsx";
import CurrentSongQueue from "../components/CurrentSongQueue.tsx";
import { useState, useEffect } from "react";
import AudioPlayer from "../components/AudioPlayer.tsx";
import Modal from "../components/Modal";



export const Home = () => {
    const navigate = useNavigate();
    const { socket, connected } = useSocket();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    const [currentQueue, setCurrentQueue] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        setCurrentQueue((prev) => [...prev, ...selectedTracks]);
    };
    
    useEffect(() => {

        {/* Check for authorization error */}
        const retrieveAccessToken = async () => {
            // TODO add code validation after completing '../spotify/SpotifyAuthCode'
            // Comment below 3 lines to test the modal
            if (!code) {
                return;
            }
            try {
                const token = await SpotifyAuthCode(code);
                if (token) {
                    setAccessToken(token);
                } else {
                    triggerError("Failed to retrieve access token. Please try logging in again.");
                }
            } catch (error) {
                triggerError("An error occurred while retrieving the access token.");
            }
        };

        retrieveAccessToken();
    }, [code]);

    const triggerError = (message: string) => {
        setError(message);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };
    return (
        <div className="">
            <div className={`w-screen flex h-screen ${isModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
                <Sidebar />
                <div className="flex-1 flex flex-col justify-between">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-2">Room name</h1>
                        <AudioPlayer songs={currentQueue} />
                        <CurrentSongQueue songs={currentQueue} />
                    </div>
                    <div className="flex justify-center pb-4 px-4">
                        <div className="w-full">
                            <TextInput />
                        </div>
                    </div>
                </div>
                <PlayLists handleAddToQueue={handleAddToQueue} />
            </div>

            {/* Modal for Error Messages */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                message={error || "An unknown error occurred."}
            />
        </div>
    );
};