import AudioPlayer from "../components/AudioPlayer"
import CurrentSongQueue from "../components/CurrentSongQueue"
import PlayLists from "../components/PlayLists"
import TextInput from "../components/TextInput"
import JoinedUsers from "../components/Users/JoinedUsers"
import { SongObj, Message, FormattedMessage, RoomComponentProps } from '../types/index';
import { useState, useEffect } from "react"

export const Room: React.FC<RoomComponentProps> = ({ socket, roomId, setUserJoined, currentUser }) => {
    const [playStatus, setPlayStatus] = useState(false)
    const [currentQueue, setCurrentQueue] = useState<SongObj[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if(socket){
            // Playlist management
            socket.on("updateSongStream", (songStream : SongObj[]) => {
                setCurrentQueue((prev) => [...prev, ...songStream])
            })
            socket.on("getCurrentSongStream", (songStream : SongObj[]) => {
                setCurrentQueue(songStream)
            })

            // Audio Player Management
            socket.on("updatePlayingStatus", (audioStatus : boolean) => {
                setPlayStatus(audioStatus)
            })

            // Listen for incoming messages
            socket.on('receiveMessage', (message: Message) => {
                setMessages(prev => [...prev, message]);
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
                    <h1 className="text-2xl font-bold mb-2">{roomId}</h1>
                    <AudioPlayer songs={currentQueue} audioPaused={playStatus} socket={socket} roomId={roomId} />
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
