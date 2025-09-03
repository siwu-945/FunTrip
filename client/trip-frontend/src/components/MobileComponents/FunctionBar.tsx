import { useState } from "react";
import SongSearch from "../SongSearch";
import SearchModal from "../Popups/SearchModal";
import PlayLists from "../PlayLists";

const FunctionBar = ({ handleAddToQueue, roomId, saveCurrentUserSession }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div>
      <div className="flex gap-3 mx-3">
        {/* Search Songs Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 text-amber-900 rounded-xl shadow-lg font-medium hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap border border-amber-400/30 backdrop-blur-sm relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"

        >
          <i className="fas fa-search"></i>
          Search Songs
        </button>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-100 to-teal-200 text-black rounded-xl font-medium shadow-md hover:from-green-200 hover:to-teal-300 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="fab fa-spotify"></i>
          Add from Spotify
        </button>
      </div>

      {/* Search Modal */}
      <SongSearch
        handleAddToQueue={handleAddToQueue}
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      <PlayLists
        handleAddToQueue={handleAddToQueue}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
        }}
        roomId={roomId}
        saveCurrentUserSession={saveCurrentUserSession}
      />
    </div>
  );
};

export default FunctionBar;
