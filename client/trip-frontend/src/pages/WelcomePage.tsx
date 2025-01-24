import React, { useState } from "react";
import "../assets/WelcomePage.css";

interface UserInfoProps {
    username: string;
    setUsername: (username: string) => void;
    roomId: string;
    setRoomId: (roomId: string) => void;
    handleJoinRoom: () => void;
}

const WelcomePage: React.FC<UserInfoProps> = ({username, setUsername, roomId, setRoomId, handleJoinRoom}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="w-full min-h-screen relative overflow-x-hidden">
            <nav className="flex justify-between items-center p-8">
                <div className="flex flex-col">
                    <div className="text-3xl logo">Supreme Karaoke</div>
                </div>
                <div className="hidden md:flex gap-8">
                    <a href="#" className="text-black hover:text-gray-600">
                        ABOUT
                    </a>
                    <a href="#" className="text-black hover:text-gray-600">
                        CONTACT
                    </a>
                    <a href="#" className="text-black hover:text-gray-600">
                        PORTFOLIO
                    </a>
                </div>
                <button onClick={toggleMenu} className="md:hidden text-2xl">
                    <i className="fas fa-bars"></i>
                </button>
            </nav>

            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-6">
                    <button onClick={toggleMenu} className="mb-8 text-2xl">
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="flex flex-col gap-6">
                        <a href="#" className="text-black hover:text-gray-600">
                            ABOUT
                        </a>
                        <a href="#" className="text-black hover:text-gray-600">
                            CONTACT
                        </a>
                        <a href="#" className="text-black hover:text-gray-600">
                            PORTFOLIO
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex flex-col items-center justify-center mt-32">
                <h1 className="text-2xl md:text-4xl text-gray-600 mb-4 text-center">
                    Find Your Friends Now
                </h1>
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
            </main>

            {/* Social Links */}
            <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
                <a href="#" className="text-black hover:text-gray-600">
                    <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-black hover:text-gray-600">
                    <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-black hover:text-gray-600">
                    <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-black hover:text-gray-600">
                    <i className="fab fa-linkedin-in"></i>
                </a>
            </div>
        </div>
    );
};

export default WelcomePage;
