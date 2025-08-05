import { GuestAudioPlayer } from "../components/Audio/GuestAudioPlayer"
import MainAudioPlayer from "../components/Audio/MainAudioPlayer"
import CurrentSongQueue from "../components/CurrentSongQueue"
import PlayLists from "../components/PlayLists"
import TextInput from "../components/TextInput"
import { ToggleBtn } from "../components/ToggleBtn"
import JoinedUsers from "../components/Users/JoinedUsers"
import { SongObj, Message, FormattedMessage, RoomComponentProps } from '../types/index';
import { useState, useEffect } from "react"
import axios from "axios";

const serverURL = import.meta.env.VITE_SERVER_URL;

export const Room: React.FC<RoomComponentProps> = ({ socket, roomId, setUserJoined, currentUser}) => {
    const [playStatus, setPlayStatus] = useState(false);
    const [progressBar, setProgressBar] = useState(0);
    const [currentQueue, setCurrentQueue] = useState<SongObj[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isParty, setIsParty] = useState(true);
    const [isHost, setIsHost] = useState<boolean>(true);

    useEffect(() => {
        if(socket){
            // Playlist management
            socket.on("updateSongStream", (songStream : SongObj[]) => {
                console.log("Song stream updated: ", songStream);
                setCurrentQueue((prev) => [...prev, ...songStream])
            })
            socket.on("getCurrentSongStream", (songStream : SongObj[]) => {
                console.log("Current song stream: ", songStream);
                setCurrentQueue(songStream)
            })

            // Audio Player Management
            socket.on("updatePlayingStatus", (audioStatus : boolean) => {
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

            socket.on('roomtypeChanged', (isParty : boolean) => {
                setIsParty(isParty);
            });

        }
        return() =>{
            if(socket){
                socket.off("updateSongStream");
                socket.off('receiveMessage');
                socket.off('getCurrentSongStream');
            }
        }
    },[socket]);

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

    // useEffect(() => {
    //     console.log("current song stream: ", currentQueue);
    // }, [currentQueue]);
    useEffect(() => {
        async function setCurrentRoomStatus() {
            const response = await axios.post<{isParty : boolean}>(`${serverURL}/room/${roomId}/setParty`, {
                isParty
            });
        }
        setCurrentRoomStatus();
        socket.emit("changeRoomType", {roomId, isParty});
    }, [isParty]);

    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        socket.emit("addSongToStream", {selectedTracks, roomId})
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

    return (
        <div className="w-screen flex h-screen">
            <JoinedUsers 
                socket={socket} 
                roomName={roomId} 
                setUserJoined={setUserJoined} 
                currentUser={currentUser}
                messages={formattedMessages}
            />
            <div className="flex-1 flex flex-col justify-between">
                {/* Main area above the search bar */}
                <div className="p-6">
                    {/* Room name and Current Song Queue */}
                   <div className="flex items-center gap-3 ">
                        <h1 className="text-2xl font-bold mb-2">{roomId}</h1>
                        
                        <ToggleBtn isParty={isParty} isHost={isHost} setIsParty={setIsParty}/>
                    </div>
                    {(isParty && isHost || !isParty) ? 
                        <MainAudioPlayer songs={currentQueue} audioPaused={playStatus} socket={socket} roomId={roomId} partyMode={isParty}/>
                        : 
                        <GuestAudioPlayer/>
                    }                     
                    <CurrentSongQueue songs={currentQueue} />
                </div>

                {/* Text Input at the bottom */}
                <div className="flex justify-center pb-4 px-4">
                    <div className="w-full">
                        <TextInput onSendMessage={handleSendMessage} />
                    </div>
                </div>
            </div>
            <PlayLists handleAddToQueue={handleAddToQueue} />
        </div>
    )
}
