import React, { useState } from "react";
import { TextInputProps } from '../types/index';

const TextInput: React.FC<TextInputProps> = ({ onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <form onSubmit={handleSendMessage} className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex items-center">
            {/* Microphone Icon */}
            <i className="fas fa-microphone text-gray-400 mr-3"></i>

            {/* Input Field */}
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message to the Room"
                className="flex-1 outline-none text-gray-700"
            />
            
            {/* Action Icons */}
            <button type="submit" className="mt-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                Send
            </button>
        </form>
    );
};

export default TextInput;