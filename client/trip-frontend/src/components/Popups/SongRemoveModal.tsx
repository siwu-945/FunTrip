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
                            <i className="fas fa-trash-alt text-white mr-2"></i>
                            <span className="text-lg font-semibold text-white">Clear Playlist</span>
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
                        <p className="text-gray-600 text-center mb-4">
                            Are you sure you want to clear the entire playlist?
                        </p>
                        
                        <button
                            onClick={() => {
                                onRemoveAll();
                                onClose();
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                        >
                            Clear Entire Playlist
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SongRemoveModal;