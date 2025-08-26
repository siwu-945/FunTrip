import React from 'react';

interface SongRemoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSongName: string;
    onRemoveSong: () => void;
    onRemoveAll: () => void;
}

const SongRemoveModal: React.FC<SongRemoveModalProps> = ({ 
    isOpen, 
    onClose, 
    selectedSongName, 
    onRemoveSong, 
    onRemoveAll 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg shadow-lg w-80 max-w-sm mx-4">
                {/* Header with orange gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <i className="fas fa-search text-white mr-2"></i>
                            <span className="text-lg font-semibold text-white">Remove Song</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"
                        >
                            <i className="fas fa-times text-white text-sm"></i>
                        </button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                onRemoveSong();
                                onClose();
                            }}
                            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-orange-300 transition-all duration-200"
                        >
                            <div>
                                <div className="font-medium text-gray-800">Remove "{selectedSongName}"</div>
                            </div>
                        </button>
                        
                        <button
                            onClick={() => {
                                onRemoveAll();
                                onClose();
                            }}
                            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-orange-300 transition-all duration-200"
                        >
                            <div>
                                <div className="font-medium text-gray-800">Clear entire playlist</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SongRemoveModal;
