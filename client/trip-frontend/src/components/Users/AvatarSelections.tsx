import { useState } from "react";
import { avatarImages, bgColors } from "./AvatarImages";

const AvatarSelections = ({selectedAvatarIdx, setSelectedAvatarIdx}) => {

    const handleAvatarSelect = (idx) => {
        setSelectedAvatarIdx(idx);

    };

    return (
        <div className="w-72">
            <label className="block text-lg font-semibold mb-3 text-shadow">
                <i className="fas fa-user-circle mr-2 text-red-400"></i>Choose Avatar
            </label>

            <div className="flex items-center gap-3 p-3 rounded-xl shadow-sm bg-[#FEFEFA] border-none">
                {/* Current Avatar Display */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-purple-500 hover:scale-105 overflow-hidden flex-shrink-0 p-1 ${bgColors[selectedAvatarIdx.idx % bgColors.length]} ${
                    selectedAvatarIdx >= 0 ? 'border-purple-500' : 'border-gray-200'
                }`}>
                    <img 
                        src={avatarImages[selectedAvatarIdx]} 
                        alt="Selected Avatar" 
                        className="w-full h-full object-cover rounded-full bg-white"
                    />
                </div>

                {/* Avatar Options */}
                <div className="flex gap-2 overflow-x-auto flex-1 py-1">
                    {avatarImages.map((avatar, idx) => (
                        <div
                            key={idx}
                            className={`w-9 h-9 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center flex-shrink-0 p-1 ${bgColors[idx % bgColors.length]} ${
                                selectedAvatarIdx === idx
                                    ? 'border-purple-500 shadow-sm shadow-purple-200'
                                    : 'border-transparent hover:border-purple-400'
                            }`}
                            onClick={() => handleAvatarSelect(idx)}
                        >
                            <img 
                                src={avatar} 
                                alt={`Avatar ${idx + 1}`} 
                                className="w-full h-full object-cover rounded-full bg-white"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AvatarSelections;