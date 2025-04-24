import AudioPlayer from "../components/AudioPlayer"
import CurrentSongQueue from "../components/CurrentSongQueue"
import PlayLists from "../components/PlayLists"
import TextInput from "../components/TextInput"
import JoinedUsers from "../components/Users/JoinedUsers"
import { SongObj } from '../types/index.ts';
import { useState, useEffect } from "react"
import { Socket } from 'socket.io-client';

interface Message {
    sender: string;
    content: string;
    timestamp: number; // Unix timestamp in milliseconds
}

interface FormattedMessage {
    type: 'date' | 'message';
    content: string;
}

interface RoomComponentProps {
    socket: Socket;
    roomId: string;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: string;
}

export const Room: React.FC<RoomComponentProps> = ({ socket, roomId, setUserJoined, currentUser }) => {
    const [currentQueue, setCurrentQueue] = useState<SongObj[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        // Listen for incoming messages
        socket.on('receiveMessage', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [socket]);

    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        const songObjs: SongObj[] = selectedTracks.map((track) => ({
            spotifyData: track,
        }));

        setCurrentQueue((prev) => [...prev, ...songObjs]);
    };

    const handleSendMessage = (content: string) => {
        if (content.trim()) {
            const messageObj: Message = {
                sender: currentUser,
                content: content.trim(),
                timestamp: Date.now()
            };
            
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
                    <AudioPlayer songs={currentQueue} />
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
