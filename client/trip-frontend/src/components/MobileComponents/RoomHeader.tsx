import React from 'react';
import { RoomHeaderProps } from '../../types';
import { ToggleBtn } from '../ToggleBtn';

export const RoomHeader: React.FC<RoomHeaderProps> = ({
    roomId,
    isParty,
    isHost,
    setIsParty,
    onExitRoom,
}) => {
    return (
        <div
            className={`border-b border-gray-200 p-5 flex justify-between items-center bg-gradient-to-r
    ${isParty ? 'from-[#F8F8F6] to-amber-300' : 'from-pink-200 to-purple-300'}`}
        >
            {/* Left side - Room info */}
            <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                    {roomId}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">

                    {/* Party Mode Toggle - only show if host */}
                    {isHost && (
                        <ToggleBtn isParty={isParty} isHost={isHost} setIsParty={setIsParty} />
                    )}

                    {/* Show party mode status for guests */}
                    {!isHost && (
                        <div className="flex items-center gap-2">
                            <span>Party Mode</span>
                            <div className={`w-2 h-2 rounded-full ${isParty ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                    )}
                </div>
            </div>

            {/* Right side - Exit button */}
            <button
                onClick={onExitRoom}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exit Room"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v8a2 2 0 002 2h4m4-6h8m-8 0l3-3m-3 3l3 3"
                    />
                </svg>
            </button>
        </div>
    );
};