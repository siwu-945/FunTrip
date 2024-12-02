import React from "react";

const TextInput: React.FC = () => {
    return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex items-center">
            {/* Microphone Icon */}
            <i className="fas fa-microphone text-gray-400 mr-3"></i>

            {/* Input Field */}
            <input
                type="text"
                placeholder="Message to the Room"
                className="flex-1 outline-none text-gray-700"
            />

            {/* Action Icons */}
            <div className="flex items-center">
                <i className="fas fa-paper-plane text-gray-400 mx-2"></i>
                <i className="fas fa-cog text-gray-400"></i>
            </div>
        </div>
    );
};

export default TextInput;
