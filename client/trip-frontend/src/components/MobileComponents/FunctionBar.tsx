import { useState } from "react";
import SongSearch from "../SongSearch";
import SearchModal from "../Popups/SearchModal";
import PlayLists from "../PlayLists";

const FunctionBar = ({ handleAddToQueue, roomId, saveCurrentUserSession}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div>
      <div className="flex gap-3">
        {/* Search Songs Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <i className="fas fa-search"></i>
          Search Songs
        </button>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
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
