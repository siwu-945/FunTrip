import { useState } from "react";
import SongSearch from "../SongSearch";

const FunctionBar = ({ handleAddToQueue }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
      >
        <i className="fas fa-search"></i>
        Search Songs
      </button>
      
      <SongSearch 
        handleAddToQueue={handleAddToQueue}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FunctionBar;