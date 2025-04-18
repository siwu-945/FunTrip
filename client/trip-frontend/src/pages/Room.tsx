import AudioPlayer from "../components/AudioPlayer"
import CurrentSongQueue from "../components/CurrentSongQueue"
import PlayLists from "../components/PlayLists"
import TextInput from "../components/TextInput"
import JoinedUsers from "../components/Users/JoinedUsers"
import { RoomProps, SongObj, User } from '../types/index.ts';
import { useState } from "react"

export const Room : React.FC<RoomProps> = ({ socket, roomId, setUserJoined, currentUser }) => {
    const [currentQueue, setCurrentQueue] = useState<SongObj[]>([]);
    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        const songObjs : SongObj[] = selectedTracks.map((track) => ({
            spotifyData : track,
        }));

        setCurrentQueue((prev) => [...prev, ...songObjs]);
    };

    return (
        <div className="w-screen flex h-screen">
            <JoinedUsers 
                socket={socket} 
                roomName={roomId} 
                setUserJoined={setUserJoined} 
                currentUser={currentUser}
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
                        <TextInput />
                    </div>
                </div>
            </div>
            <PlayLists handleAddToQueue={handleAddToQueue} />
        </div>
    )
}
