import React from 'react';
interface UserInfoProps {
    username: string;
    setUsername: (username: string) => void;
    roomId: string;
    setRoomId: (roomId: string) => void;
    handleJoinRoom: () => void;
}
const UserInfo : React.FC<UserInfoProps> = ({username, setUsername, roomId, setRoomId, handleJoinRoom}) => {
    return (
        <div className="mb-4">
            <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full mb-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-md focus:ring focus:ring-gray-200 focus:border-gray-500"
            />
            <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="block w-full mb-3 px-4 py-3 text-gray-700 border border-gray-300 rounded-md focus:ring focus:ring-gray-200 focus:border-gray-500"
            />
            <button
                className="w-full max-w-md px-4 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:ring focus:ring-gray-200 transition"
                onClick={handleJoinRoom}
            >
                Join
            </button>
        </div>
    )
}
export default UserInfo;