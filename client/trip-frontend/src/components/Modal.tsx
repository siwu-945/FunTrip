import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        // define the modal popup
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg shadow-lg w-1/3">
            <div className="bg-yellow-500 text-white text-lg font-semibold p-4 rounded-t-lg">
                Attention
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-4">{message}</p>
                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
