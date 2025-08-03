import React from 'react';

interface JoinPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    password: string;
    setPassword: (password: string) => void;
    onSubmit: () => void;
    error?: string;
}

const JoinPasswordModal: React.FC<JoinPasswordModalProps> = ({
    isOpen,
    onClose,
    password,
    setPassword,
    onSubmit,
    error
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Enter Room Password</h2>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    autoFocus
                />
                <div className="flex space-x-3">
                    <button
                        onClick={onSubmit}
                        className="flex-1 p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Join
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 p-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinPasswordModal;