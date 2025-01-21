import React from "react";

interface User {
    id: string;
    username: string;
}

interface JoinedUsersProps {
    users: User[];
    roomName : string;
}

const JoinedUsers: React.FC<JoinedUsersProps> = ({users, roomName}) => {

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="font-semibold text-2xl text-gray-700">
                        <a href="/client/trip-frontend/public" className="font-semibold text-2xl text-gray-700 no-underline hover:text-gray-900">
                            Karaoke King
                        </a>
                    </span>
                </div>
                <i className="fas fa-edit text-gray-600"></i>
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
