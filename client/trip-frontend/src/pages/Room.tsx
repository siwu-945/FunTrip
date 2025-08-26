import { GuestAudioPlayer } from "../components/Audio/GuestAudioPlayer"
import MainAudioPlayer from "../components/Audio/MainAudioPlayer"
import CurrentSongQueue from "../components/CurrentSongQueue"
import { SongObj, Message, FormattedMessage, RoomComponentProps, UserSession } from '../types/index';
import { useState, useEffect } from "react"
import axios from "axios";
import { RoomHeader } from "../components/MobileComponents/RoomHeader"
import { getCookie, removeCookie } from "../tools/Cookies";
import FunctionBar from "../components/MobileComponents/FunctionBar"


const serverURL = import.meta.env.VITE_SERVER_URL;
const SESSION_KEY = 'spotify_room_session';
const SESSION_EXPIRY_HOURS = 2;

export const Room: React.FC<RoomComponentProps> = ({ socket, roomId, setUserJoined, currentUser }) => {
    const [playStatus, setPlayStatus] = useState(false);
    const [progressBar, setProgressBar] = useState(0);
    const [currentQueue, setCurrentQueue] = useState<SongObj[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isParty, setIsParty] = useState(true);
    const [isHost, setIsHost] = useState<boolean>(true);

    useEffect(() => {
        if (socket) {
            const savedSession = getSavedUserSession()
            if(savedSession){
                socket.emit("userRejoined", {
                    roomId: savedSession.roomId,
                    username: savedSession.username
                })
                clearSavedUserSession();
            }
            // Playlist management
            socket.on("updateSongStream", (songStream: SongObj[]) => {
                console.log("Song stream updated: ", songStream);
                setCurrentQueue((prev) => [...prev, ...songStream])
            })
            socket.on("getCurrentSongStream", (songStream: SongObj[]) => {
                console.log("Current song stream: ", songStream);
                setCurrentQueue(songStream)
            })

            // Audio Player Management
            socket.on("updatePlayingStatus", (audioStatus: boolean) => {
                setPlayStatus(audioStatus)
            })

            // socket.on("currentProgress", ({isPaused, pausedAt, startedAt} : {isPaused : boolean, pausedAt : number, startedAt : number}) => {
            //     if(isPaused){
            //         console.log("paused at: ", pausedAt);
            //         setProgressBar(pausedAt);
            //     }else{
            //         const currentTime = Date.now();
            //         const elapsedTime = currentTime - startedAt;
            //         console.log("currentTime: ", currentTime, " startedAt: ", startedAt, " elapsedTime: ", elapsedTime);
            //         const progress = (elapsedTime / (pausedAt - startedAt)) * 100;
            //         setProgressBar(progress);
            //     }
            // })

            // Listen for incoming messages
            socket.on('receiveMessage', (message: Message) => {
                setMessages(prev => [...prev, message]);
            });

            socket.on('roomtypeChanged', (isParty: boolean) => {
                setIsParty(isParty);
            });

        }
        return () => {
            if (socket) {
                socket.off("updateSongStream");
                socket.off('receiveMessage');
                socket.off('getCurrentSongStream');
            }
        }
    }, [socket]);

    useEffect(() => {
        async function checkHostStatus() {
            try {
                // Call the server to check if the user is host
                const response = await axios.get<{ isHost: boolean }>(`${serverURL}/room/${roomId}/isHost`, {
                    params: {
                        roomId: roomId,
                        userName: currentUser
                    }
                });
                setIsHost(response.data.isHost);
            } catch (error) {
                console.error("Error checking host status:", error);
                setIsHost(false); // fallback
            }
        }
        checkHostStatus();
    }, [roomId, currentUser]);

    useEffect(() => {
        async function setCurrentRoomStatus() {
            const response = await axios.post<{ isParty: boolean }>(`${serverURL}/room/${roomId}/setParty`, {
                isParty
            });
        }
        setCurrentRoomStatus();
        socket.emit("changeRoomType", { roomId, isParty });
    }, [isParty]);

    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        socket.emit("addSongToStream", { selectedTracks, roomId })
    };
    
    const handleSendMessage = (content: string) => {
        if (content) {
            const messageObj: Message = {
                sender: currentUser,
                content: content,
                timestamp: Date.now()
            };

            // Only emit the message to server, don't add to local state
            // The message will be added when received through socket
            socket.emit('sendMessage', { roomId, message: messageObj });
        }
    };

    const handleUserLeave = () => {
        // cleaning up auth code in the URL
        window.history.pushState({}, "", "/");

        setUserJoined(false);

        removeCookie("username");
        removeCookie("roomId");

        socket.emit("exitRoom", roomId);
    };

    const formattedMessages = messages.reduce<FormattedMessage[]>((acc, msg, index) => {
        const messageDate = new Date(msg.timestamp);
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;

        // Format time as HH:mm
        const timeStr = messageDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Add date separator if
        // it's the first message, or
        // the date is different from the previous message
        if (!prevDate || messageDate.toDateString() !== prevDate.toDateString()) {
            acc.push({
                type: 'date',
                content: messageDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\//g, '-')
            });
        }

        // Add the message with timestamp
        acc.push({
            type: 'message',
            content: `${msg.sender}(${timeStr}): ${msg.content}`
        });

        return acc;
    }, []);

    function saveCurrentUserSession() {
        const sessionData: UserSession = {
            roomId: roomId,
            username: currentUser
        };
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            console.log('Session saved successfully');
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    function getSavedUserSession(): UserSession | null {
        try {
            const savedSession = localStorage.getItem(SESSION_KEY);
            if (!savedSession) {
                return null;
            }
            const sessionData: UserSession = JSON.parse(savedSession);
            return sessionData;

        } catch (error) {
            console.error('Failed to retrieve session:', error);
            clearSavedUserSession();
            return null;
        }
    }

    function clearSavedUserSession(): void {
        try {
            localStorage.removeItem(SESSION_KEY);
            console.log('Session cleared');
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    if (true) {
        return (
            <div className="min-h-screen bg-gray-50">
                <RoomHeader
                    roomId={roomId}
                    isParty={isParty}
                    isHost={isHost}
                    setIsParty={setIsParty}
                    onExitRoom={() => {
                        handleUserLeave();
                    }}
                />
                {(isParty && isHost || !isParty) ?
                    <MainAudioPlayer songs={currentQueue} audioPaused={playStatus} socket={socket} roomId={roomId} partyMode={isParty} />
                    :
                    <GuestAudioPlayer />
                }
                <FunctionBar handleAddToQueue={handleAddToQueue} roomId={roomId} saveCurrentUserSession={saveCurrentUserSession}/>
                <CurrentSongQueue songs={currentQueue} />
            </div>
        )
    }
}
