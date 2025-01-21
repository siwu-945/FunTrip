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
        <div style={{marginBottom: "1rem"}}>
            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{display: "block", marginBottom: "0.5rem"}}
            />
            <input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{display: "block", marginBottom: "0.5rem"}}
            />
            <button onClick={handleJoinRoom}>Join</button>
        </div>
    )
}

export default UserInfo;