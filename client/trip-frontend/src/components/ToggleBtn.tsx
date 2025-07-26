import { useState } from "react";
import { ToggleProps } from "../types";

export const ToggleBtn: React.FC<ToggleProps> = ({ isParty, setIsParty }) => {

    return (
        // <div
        //     className={`flex flex-col items-center justify-center mb-6 p-3 rounded-xl transition-colors duration-300 ${
        //         isSharing ? 'bg-[#b6f0e2]' : 'bg-[#f0b6c9]'
        //     }`}
        // >
        //     <span className="text-base md:text-lg font-semibold text-gray-800 mb-1 tracking-wide">
        //         {isSharing ? 'Sharing Mode' : 'Party Mode'}
        //     </span>
        //     <label className="relative inline-block w-10 h-5">
        //         <input
        //             type="checkbox"
        //             checked={isSharing}
        //             onChange={() => setIsSharing(!isSharing)}
        //             className="sr-only peer"
        //         />
        //         <div className="w-full h-full bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-300"></div>
        //         <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
        //     </label>
        // </div>

        <div className="flex items-center gap-3 mb-4">
            <label className="relative inline-block w-12 h-6">
                <input
                    type="checkbox"
                    checked={isParty}
                    onChange={() => setIsParty(!isParty)}
                    className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-300"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
            </label>
            <span className="text-gray-700 text-sm font-medium">
                {isParty ? 'Party Mode' : 'Is Alone (TODO)'}
            </span>
        </div>

    );
};