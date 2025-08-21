import React, { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';
import { getCookie, removeCookie } from "../../tools/Cookies";
const serverURL = import.meta.env.VITE_SERVER_URL;
import axios from "axios";
interface FormattedMessage {
    type: 'date' | 'message';
    content: string;
}

interface JoinedUsersProps {
    roomName: string;
    socket: Socket;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    messages: FormattedMessage[];
    currentUser: string;
}

const JoinedUsers: React.FC<JoinedUsersProps> = ({ roomName, socket, setUserJoined, currentUser, messages }) => {

    const [joinedUser, setJoinedUsers] = useState<string[]>([]);
    const [hostName, setHostName] = useState<string>("");
    /** 
     * Why cookies are used? 
    Retain user session saved in cookies
    So if user refreshes/redirect back to our main application, they are still in the same room
    
    We also have to rejoin the room, because everytime the web refreshes, it will generate a new socket
    */

    useEffect(() => {
        const savedUserName = getCookie("username");
        const savedRoomId = getCookie("roomId");
        // Emit joinRoom event when user refreshes the page
        socket.emit("joinRoom", { roomId: savedRoomId, username: savedUserName });
    }, []);

    // listen and update for userJoined and userLeft events
    useEffect(() => {
        if (socket) {
            socket.on("userJoined", (updatedUserNames: string[]) => {
                setJoinedUsers(updatedUserNames);
            });
            socket.on("userLeft", (updatedUserNames: string[]) => {
                setJoinedUsers(updatedUserNames);
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

    useEffect(() => {
        async function getHostId() {
            try {
                // Call the server to get the host id
                const response = await axios.get<{ hostId: string }>(`${serverURL}/room/getHost`, {
                    params: {
                        roomId: roomName,
                        userName: currentUser
                    }
                });
                setHostName(response.data.hostId);
            } catch (error) {
                console.error("Error checking host status:", error);
            }
        }
        getHostId();
    },);
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
        <aside className="w-64 h-screen bg-gray-50 p-4 overflow-y-auto border-r flex flex-col justify-between">
            <div>
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
                            <li
                                key={idx}
                                className={`py-2 px-4 text-sm hover:bg-gray-200 rounded ${username === currentUser ? "bg-orange-100 text-orange-500 font-medium" : "text-gray-700"}`}>
                                {username}
                                {username === hostName && (<span className="ml-2 text-yellow-500" title="Host">★</span>)}
                                {currentUser === hostName && username !== hostName && (
                                    <button
                                        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                        title="Make Host"
                                        onClick={() => socket.emit("setHost", { roomId: roomName, newHost: username })}
                                    >
                                        Make Host
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="h-1/3 overflow-y-auto border-t pt-2">
                <h4>Messages</h4>
                <ul>
                    {messages.map((msg, idx) => (
                        msg.type === 'date' ? (
                            <li key={`date-${idx}`} className="text-xs text-center text-gray-500 my-2">
                                {msg.content}
                            </li>
                        ) : (
                            <li key={`msg-${idx}`} className="py-2 px-4 text-sm text-gray-700 rounded mb-1">
                                {msg.content}
                            </li>
                        )
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default JoinedUsers;
