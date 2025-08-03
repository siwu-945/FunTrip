import React, { useState } from 'react';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordChoice: (wantsPassword:boolean) => void;
    showPasswordInput: boolean;
    password: string;
    setPassword: (password: string) => void;
    onSubmitPassword: (password: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
    isOpen,
    onClose,
    onPasswordChoice,
    showPasswordInput,
    password,
    setPassword,
    onSubmitPassword
}) =>{
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Would you like to set a password for your room?</h2>
                
                {!showPasswordInput ?(
                    // Set password yes or no choice
                    <div className="space-y-3">
                        <button
                            onClick={() => onPasswordChoice(true)}
                            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => onPasswordChoice(false)}
                            className="w-full p-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                            autoFocus
                        >
                            No
                        </button>
                    </div>
                ):(
                    // show password input and create/cancel option
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => onSubmitPassword(password)}
                                className="flex-1 p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                                Create
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 p-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordModal;