import { useState } from "react";
import { ToggleProps } from "../types";

export const ToggleBtn: React.FC<ToggleProps> = ({ isParty, isHost, setIsParty }) => {
    return (
        <div className="flex items-center gap-3">
            <label className="relative inline-block w-12 h-6">
                <input
                    type="checkbox"
                    checked={isParty}
                    onChange={() => isHost && setIsParty(!isParty)}
                    className="sr-only peer"
                    disabled={!isHost}
                />
                <div
                    className={`w-full h-full rounded-full transition-colors duration-300 
                        ${!isHost ? "bg-gray-200" : "bg-gray-300 peer-checked:bg-red-400"}`}
                ></div>
                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 
                    peer-checked:translate-x-6 ${!isHost ? "opacity-60" : ""}`}></div>
            </label>
            <span className={`text-gray-700 text-sm font-medium ${isHost ? "opacity-60" : ""}`}>
                {isParty ? 'Party Mode' : 'Far Far Away'}
                {!isHost && " (Guests cannot toggle)"}
            </span>
        </div>
    );
};