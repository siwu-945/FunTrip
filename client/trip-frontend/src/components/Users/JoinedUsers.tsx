import React, { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';
import { getCookie, removeCookie } from "../../tools/Cookies";
const serverURL = import.meta.env.VITE_SERVER_URL;
import axios from "axios";
import UserProfile from "./UserProfile";
import { JoinedUsersProps, User, FormattedMessage} from "../../types";


const JoinedUsers: React.FC<JoinedUsersProps> = ({ roomName, socket, setUserJoined, currentUser, messages, avatarIdx}) => {

    const [joinedUser, setJoinedUsers] = useState<User[]>([]);
    const [hostName, setHostName] = useState<string>("");

    useEffect(() => {
        const savedUserName = getCookie("username");
        const savedRoomId = getCookie("roomId");
        const savedIdx = getCookie("avatarIdx");
        socket.emit("joinRoom", { roomId: savedRoomId, username: savedUserName, avatarIdx: parseInt(savedIdx, 10) });
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("userJoined", (updatedUserNames: User[]) => {
                setJoinedUsers(updatedUserNames);
            });
            socket.on("userLeft", (updatedUserNames: User[]) => {
                setJoinedUsers(updatedUserNames);
            });
        }

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
    }, []);

    return (
        <div className="px-4 pt-3">
            {/* Horizontal Users Layout */}
            <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-700">
                    Connected Users ({joinedUser.length})
                </h4>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {joinedUser.map((user, idx) => (
                    <div
                        key={idx}
                        className="flex-shrink-0 group"
                        title={`${user[1].username}${user[1].username === hostName ? ' (Host)' : ''}${user[1].username === currentUser ? ' (You)' : ''}`}
                    >
                        {/* User Card */}
                        <div className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[50px]`}>
                            {/* Profile Picture with Host Badge */}
                            <div className="relative">
                                <UserProfile username={user[1].username} pfpIndex={user[1].avatarIdx}/>
                                {user[1].username === hostName && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-yellow-800 text-xs">★</span>
                                    </div>
                                )}
                            </div>

                            {/* Username */}
                            <div className="text-center">
                                <span className={`text-xs font-medium block truncate max-w-[60px] ${user[1].username === currentUser ? "text-orange-700" : "text-gray-700"
                                    }`}>
                                    {user[1].username}
                                </span>
                            </div>

                            {/* Compact Make Host Button (only shows on hover for hosts) */}
                            {/* {currentUser === hostName && username !== hostName && (
                                <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 whitespace-nowrap"
                                    onClick={() => socket.emit("setHost", { roomId: roomName, newHost: username })}
                                >
                                    Make Host
                                </button>
                            )} */}
                        </div>
                    </div>
                ))}


                {/* Empty State */}
                {joinedUser.length === 0 && (
                    <div className="flex items-center text-gray-400 text-sm py-4">
                        <i className="fas fa-users mr-2"></i>
                        Waiting for users to join...
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinedUsers;