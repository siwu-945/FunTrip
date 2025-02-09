import React, { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';
import { User } from '../../types/index';
import { getCookie, removeCookie } from "../../tools/Cookies";


interface JoinedUsersProps {
    roomName: string;
    socket: Socket;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
}

const JoinedUsers: React.FC<JoinedUsersProps> = ({ roomName, socket, setUserJoined }) => {

    const [joinedUser, setJoinedUsers] = useState<string[]>([]);

    /** 
     * Why cookies are used? 
    Retain user session saved in cookies
    So if user refreshes/redirect back to our main application, they are still in the same room
    
    We also have to rejoin the room, because everytime the web refreshes, it will generate a new socket
    */
    useEffect(() => {
        const savedUserName = getCookie("username");
        const savedRoomId = getCookie("roomId");

        socket.emit("joinRoom", { roomId: savedRoomId, username: savedUserName });
    }, []);

    // listen and update for userJoined and userLeft events
    useEffect(() => {
        if (socket) {
            socket.on("userJoined", (updatedUsers: User[]) => {
                const names: string[] = updatedUsers.map((user) => user.username);
                setJoinedUsers(names);
            });
            socket.on("userLeft", (updatedUsers: User[]) => {
                const names: string[] = updatedUsers.map((user) => user.username);
                setJoinedUsers(names);
            });
        }

        // Cleanup listeners on unmount or if userJoined/socket changes
        return () => {
            if (socket) {
                socket.off("userJoined");
                socket.off("userLeft");
            }
        };
    }, [socket]);

    const handleUserLeave = () => {
        // cleaning up auth code in the URL
        window.history.pushState({}, "", "/");

        setUserJoined(false);

        removeCookie("username");
        removeCookie("roomId");
        
        socket.emit("exitRoom", roomName);
        socket.emit("getUserNames", roomName, (users: string[]) => {
            setJoinedUsers(users);
        });
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
                    {joinedUser.map((username, idx) => (
                        <li key={idx} className="py-2 px-4 text-sm text-gray-700 hover:bg-gray-200 rounded">
                            {username}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default JoinedUsers;
