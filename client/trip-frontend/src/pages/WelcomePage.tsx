import React, { useState } from "react";
import "../assets/WelcomePage.css";
import SimpleToggle from "../components/Popups/SimpleToggle";
import AvatarSelections from "../components/Users/AvatarSelections";
import { avatarImages } from "../components/Users/AvatarImages";

interface UserInfoProps {
    username: string;
    setUsername: (username: string) => void;
    roomId: string;
    setRoomId: (roomId: string) => void;
    handleJoinRoom: (action: 'create' | 'join') => void;
    selectedAvatarIdx: number;
    setSelectedAvatarIdx: (idx: number) => void;
}

const WelcomePage: React.FC<UserInfoProps> = ({ username, setUsername, roomId, setRoomId, handleJoinRoom, selectedAvatarIdx, setSelectedAvatarIdx}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Add state for your toggles
    const [partyMode, setPartyMode] = useState(true);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div id="welcome-page" className="w-full min-h-screen relative overflow-x-hidden">
            <nav className={`flex justify-between items-center p-8 ${isMenuOpen ? " blur-md" : ""}`}>
                <div>
                    <div className="text-2xl font-semibold">
                        Supreme</div>
                    <div className="text-lg font-semibold">Karaoke</div>
                </div>
                <div className="hidden md:flex gap-8">
                    <a href="#" className="text-black hover:text-gray-600">
                        ABOUT
                    </a>
                    <a href="#" className="text-black hover:text-gray-600">
                        CONTACT
                    </a>
                    <a href="#" className="text-black hover:text-gray-600">
                        NERDY
                    </a>
                </div>
                <button
                    onClick={toggleMenu}
                    className="md:hidden text-2xl text-gray-800 hover:text-purple-600 transition-colors duration-200 
    p-2 rounded-lg hover:bg-gray-100"
                >
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} transition-transform duration-300`}></i>
                </button>
            </nav>

            <div
                className={`fixed top-0 right-0 h-full w-72
    bg-[#F8F8F6] shadow-2xl border-l border-gray-200
    transform transition-all duration-300 ease-in-out z-50
    ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-8">
                    {/* Close button */}
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-800 hover:text-purple-600 text-2xl p-2 rounded-lg 
                hover:bg-gray-100 transition-all duration-200"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Menu items */}
                    <div className="flex flex-col gap-8">
                        <a
                            href="#"
                            className="text-gray-800 hover:text-purple-600 text-xl font-medium 
                transition-all duration-200 border-b border-gray-300 pb-3
                hover:border-purple-400 hover:pl-2"
                        >
                            ABOUT
                        </a>
                        <a
                            href="#"
                            className="text-gray-800 hover:text-purple-600 text-xl font-medium 
                transition-all duration-200 border-b border-gray-300 pb-3
                hover:border-purple-400 hover:pl-2"
                        >
                            CONTACT
                        </a>
                        <a
                            href="#"
                            className="text-gray-800 hover:text-purple-600 text-xl font-medium 
                transition-all duration-200 border-b border-gray-300 pb-3
                hover:border-purple-400 hover:pl-2"
                        >
                            NERDY
                        </a>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-20 right-8 text-gray-200 text-6xl">
                    <i className="fas fa-music"></i>
                </div>
            </div>

            {/* Main Content */}
            <main className={`flex flex-col items-center mt-20 pb-20 text-center ${isMenuOpen ? " blur-md" : ""}`}>
                <h1 className="text-2xl font-normal text-left">
                    Your Party.<br />Your Music.
                </h1>
                <h1 className="text-2xl font-normal mb-12 text-center">You're Together.</h1>

                <div className="w-72 text-left space-y-6">
                    <div>
                        <label className="block text-lg font-semibold mb-3 text-shadow">
                            <i className="fas fa-user mr-2 text-purple-500"></i>Your Name
                        </label>
                        <input
                            type="text"
                            placeholder="ENTER YOUR NAME"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-72 p-4 rounded-xl shadow-md bg-[#FEFEFA] border-none text-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold mb-3 text-shadow">
                            <i className="fas fa-key mr-2 text-blue-500"></i>Room Name
                        </label>                        <input
                            type="text"
                            placeholder="ENTER ROOM NAME"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-72 p-4 rounded-xl shadow-md bg-[#FEFEFA] border-none text-gray-800"
                        />
                    </div>
                    <AvatarSelections selectedAvatarIdx={selectedAvatarIdx} setSelectedAvatarIdx={setSelectedAvatarIdx}/>

                    <div className="pt-4">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-semibold">
                                Party Mode <i className="fas fa-info-circle text-gray-500"></i>
                            </span>
                            <SimpleToggle
                                isParty={partyMode}
                                isHost={true}
                                setIsParty={setPartyMode}
                            />

                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-4">
                        <button
                            onClick={() => handleJoinRoom('join')}
                            className="relative w-full bg-[#F4F4DB] rounded-xl shadow-lg py-4 font-bold text-lg
                            transition-all duration-200 ease-in-out
                            hover:shadow-xl hover:-translate-y-1
                            outline-none ring-0 focus:outline-none focus:ring-0 border-0 focus:border-0"
                        >
                            <i className="fas fa-music absolute left-6 top-1/2 transform -translate-y-1/2"></i>
                            <span className="block text-center">Join Room</span>
                        </button>
                        <div className="pt-2">
                            <button
                                onClick={() => handleJoinRoom('create')}
                                className="relative w-full bg-[#F4F4DB] rounded-xl shadow-lg py-4 font-bold text-lg
                            transition-all duration-200 ease-in-out
                            hover:shadow-xl hover:-translate-y-1
                            outline-none ring-0 focus:outline-none focus:ring-0 border-0 focus:border-0"
                            >
                                <i className="fas fa-plus absolute left-6 top-1/2 transform -translate-y-1/2 text-xl"></i>
                                <span className="block text-center">Create Room</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WelcomePage;