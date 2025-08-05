import {useNavigate} from 'react-router-dom';
import {useSearchParams} from 'react-router-dom';
import {useSocket} from '../hooks/useSocket';
import {useState, useEffect} from "react";
import Modal from "../components/Popups/Modal.tsx";
import WelcomePage from "./WelcomePage.tsx";
import Footer from "../components/Banners/Footer.tsx";
import {getCookie, setCookie} from "../tools/Cookies.ts";
import { Room } from './Room.tsx';
import PasswordModal from '../components/Popups/CreatePasswordModal.tsx';
import JoinPasswordModal from '../components/Popups/JoinPasswordModal.tsx';
import axios from 'axios';

export const Home = () => {
    const navigate = useNavigate();
    const {socket} = useSocket();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    const [userName, setUserName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [userJoined, setUserJoined] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [showPasswordModal,setShowPasswordModal] = useState(false);
    const [password,setPassWord] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showJoinPasswordModal, setShowJoinPasswordModal] = useState(false);
    const [joinPassword, setJoinPassword] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [joinUserName, setJoinUserName] = useState('');
    const [joinPasswordError, setJoinPasswordError] = useState('');

    // Emit joinRoom event when user tries to create or join room.
    const handleJoinRoom = async (action: 'create' | 'join') => {
        // creating a room, pop up password modal
        if (action == 'create') {
            setShowPasswordModal(true);
            return;
        }
        // joining a room
        setCookie("username", userName, {expires: 7, path: "/"});
        setCookie("roomId", roomId, {expires: 7, path: "/"});

        if (!userName.trim() || !roomId.trim()) {
            alert("Please enter a valid username and room ID!");
            return;
        }
        try {
            const response = await axios.get<{ requiresPassword: boolean }>(
                `${import.meta.env.VITE_SERVER_URL}/room/${roomId}/requiresPassword`
            );
            
            if (response.data.requiresPassword) {
                setJoinRoomId(roomId);
                setJoinUserName(userName);
                setShowJoinPasswordModal(true);
            } else {
                if (socket) {
                    socket.emit("joinRoom", {roomId, username: userName, action});
                }
                setUserJoined(true);
            }
        } catch (error) {
            alert("Failed to check room password status.");
        }
    };
    // handle user password preference
    const handlePasswordChoice = (wantsPassword: boolean) => {
        if (wantsPassword) {
            setShowPasswordInput(true);
        } else {
            createRoomWithPassword('');
        }
    }
    // create a room with a password
    const createRoomWithPassword = (roomPassword?: string) => {
        setCookie("username", userName, {expires: 7, path: "/"});
        setCookie("roomId", roomId, {expires: 7, path: "/"});
        if (!userName.trim() || !roomId.trim()) {
            alert("Please enter a valid username and room ID!");
            return;
        }
        if (socket) {
            socket.emit("joinRoom", {roomId, username: userName, action: 'create', password: roomPassword});
        }
        setUserJoined(true);
        setShowPasswordModal(false);
        setShowPasswordInput(false);
        setPassWord('');
    }


    // TODO use cookie to get and set user info, so when they come back, they are in the same session/room
    useEffect(() => {
        const savedUsername = getCookie("username");
        const savedRoomId = getCookie("roomId");

        if (savedUsername && savedRoomId) {
            setUserName(savedUsername);
            setRoomId(savedRoomId);
            setUserJoined(true);
        }
    }, []);

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

    useEffect(() => {
        if (!socket) return;
        const handleRoomError = (data: { message: string }) => {
            triggerError(data.message);
            setUserJoined(false);
        };
        socket.on('roomError', handleRoomError);
        return () => {
            socket.off('roomError', handleRoomError);
        };
    }, [socket]);

    // useEffect(() => {
    //     if (userJoined && socket) {
    //         socket.on("userJoined", (updatedUsers: User[]) => {
    //             setJoinedUsers(updatedUsers);
    //         });
    //         socket.on("userLeft", (updatedUsers: User[]) => {
    //             setJoinedUsers(updatedUsers);
    //         });
    //     }

    //     // Cleanup listeners on unmount or if userJoined/socket changes
    //     return () => {
    //         if (socket) {
    //             socket.off("userJoined");
    //             socket.off("userLeft");
    //         }
    //     };
    // }, [userJoined, socket]);

    return (
        <div className="w-screen h-screen">
            {/* If user not joined, show Welcome Page
            Otherwise, show Room Page */}
            {!userJoined ? (
                    <WelcomePage
                        username={userName}
                        setUsername={setUserName}
                        roomId={roomId}
                        setRoomId={setRoomId}
                        handleJoinRoom={handleJoinRoom}
                    />) :(
                    <Room 
                        socket={socket} 
                        // joinedUser={joinedUser} 
                        roomId={roomId} 
                        setUserJoined={setUserJoined}
                        currentUser={userName}
                    />
            )}
            {/* TODO Update Modal for more Error Messages */
            }
            <Modal isOpen={isModalOpen} onClose={closeModal} message={error || "An unknown error occurred."}/>
            <Footer/>
            <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false);
                    setShowPasswordInput(false);
                    setPassWord('');
                }}
                onPasswordChoice={handlePasswordChoice}
                showPasswordInput={showPasswordInput}
                password={password}
                setPassword={setPassWord}
                onSubmitPassword={() => createRoomWithPassword(password)}
            />
            <JoinPasswordModal
                isOpen={showJoinPasswordModal}
                onClose={() => {
                    setShowJoinPasswordModal(false);
                    setJoinPassword('');
                    setJoinPasswordError('');
                }}
                password={joinPassword}
                setPassword={setJoinPassword}
                onSubmit={async () => {
                    // Validate password with backend
                    try {
                        const response = await axios.post<{ valid: boolean }>(
                            `${import.meta.env.VITE_SERVER_URL}/room/${joinRoomId}/validatePassword`,
                            { password: joinPassword },
                            { headers: { 'Content-Type': 'application/json' } }
                        );
            
                        if (response.data.valid) {
                            if (socket) {
                                socket.emit("joinRoom", { 
                                    roomId: joinRoomId, 
                                    username: joinUserName, 
                                    action: 'join', 
                                    password: joinPassword 
                                });
                            }
                            setUserJoined(true);
                            setShowJoinPasswordModal(false);
                            setJoinPassword('');
                            setJoinPasswordError('');
                        } else {
                            setJoinPasswordError('Incorrect password. Please try again.');
                        }
                    } catch (error) {
                        setJoinPasswordError('Failed to validate password.');
                    }
                }}
                error={joinPasswordError}
            />
        </div>
    );
};