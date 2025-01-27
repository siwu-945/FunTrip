import React, { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';
import { User } from '../../types/index';


interface JoinedUsersProps {
    users: User[];
    roomName: string;
    socket: Socket;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
}

const JoinedUsers: React.FC<JoinedUsersProps> = ({ users, roomName, socket, setUserJoined}) => {

    const [joinedUser, setJoinedUsers] = useState<User[]>([]);
    const [triggered, setTriggered] = useState<boolean>(false);
    useEffect(() => {
        socket.emit("getRoomUsers", roomName, (users: User[]) => {
            console.log("Users in the room:", users);
            setJoinedUsers(users);
        });

    }, [triggered]);

    useEffect(() => {
        console.log("take a look at joined users: " + joinedUser);

    }, [joinedUser]);

    const handleUserLeave = () => {
        // cleaning up auth code
        window.history.pushState({}, "", "/");

        setUserJoined(false);
        socket.emit("existRoom", roomName);
    };


    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="font-semibold text-2xl text-gray-700">
                        <a href="#" className="font-semibold text-2xl text-gray-700 no-underline hover:text-gray-900">
                            Karaoke King
                        </a>
                    </span>
                </div>
                <div>
                    <i 
                        className="fas fa-sign-out-alt text-gray-600"
                        title="Leave Room"
                        onClick={handleUserLeave}
                    ></i>

                </div>
            </div>
            <h3>Welcome to room {roomName}</h3>
            <nav>
                <ul>
                    {users.map((user, idx) => (
                        <li key={idx} className="py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded">
                            {user.username}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default JoinedUsers;
