import React, { useEffect, useState } from "react";
import axios from "axios";
import { SearchResult, SearchResponse, PlaylistProps } from "../types/index";
import SearchModal from "./Popups/SearchModal.tsx";
const serverURL = import.meta.env.VITE_SERVER_URL;

const SongSearch = ({ handleAddToQueue, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  const handleSearch = async (sortOverride?: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    try {
      // Call the server to search for songs
      const response = await axios.post<SearchResponse>(`${serverURL}/search-songs`, {
        query: searchQuery,
        maxResults: 10,
        sortBy: sortOverride || sortBy,
      });
      setSearchResults(response.data.results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      window.dispatchEvent(
        new CustomEvent("modalError", {
          detail: { message: "Failed to search for songs. Please try again." },
        })
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    if (searchQuery.trim()) {
      handleSearch(newSort);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddSearchResult = (searchResult) => {
    const mockSpotifyTrack = {
      added_at: new Date().toISOString(),
      added_by: null,
      is_local: false,
      track: {
        id: searchResult.id,
        name: searchResult.title,
        artists: [{ id: '', name: searchResult.uploader }],
        album: { id: '', name: '', images: [] },
        duration_ms: searchResult.duration * 1000,
        explicit: false,
        external_ids: {},
        external_urls: { spotify: searchResult.webpage_url },
        href: searchResult.webpage_url,
        is_local: false,
        is_playable: true,
        linked_from: null,
        popularity: 0,
        preview_url: null,
        restrictions: null,
        type: 'track',
        uri: searchResult.webpage_url
      }
    };
    handleAddToQueue([mockSpotifyTrack]);

    // Success animation and close
    const button = document.querySelector(`[data-result-id="${searchResult.id}"]`);
    if (button) {
      button.innerHTML = '<i class="fas fa-check text-green-500"></i>';
      button.classList.add('bg-green-50', 'border-green-200');
    }

    setTimeout(() => {
      onClose();
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
    }, 800);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  }, [isOpen]);

  return (
    <SearchModal isOpen={isOpen} onClose={onClose} title="Search Songs">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for songs, artists, or albums..."
            className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400 group-hover:border-gray-300"
            autoFocus
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
className="absolute right-3 top-1/2 transform -translate-y-1/2 
             w-8 h-8 flex items-center justify-center 
             bg-white rounded-lg 
             hover:border-gray-300 hover:bg-gray-50 
             transition-colors duration-200 disabled:cursor-not-allowed"          >
            {isSearching ? (
              <i className="fas fa-spinner fa-spin border-t-transparent rounded-full"></i>
              // <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

            ) : (
              <i className="fas fa-search text-gray-500"></i>
              // <i className="fas fa-search text-gray-500"></i>

            )}
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {showSearchResults && searchResults.length > 0 && `${searchResults.length} results found`}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-1 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="date">Most Recent</option>
              <option value="views">Most Listened</option>
              <option value="alphabetic">A-Z</option>
            </select>
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-search text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">No results found</p>
            <p className="text-gray-400 text-xs">Try adjusting your search terms or check the spelling</p>
          </div>
        )}

        {showSearchResults && searchResults.length > 0 && (
          <div className="space-y-2 animate-fadeIn">
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                className="p-3 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group animate-slideInUp"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleAddSearchResult(result)}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-music text-gray-400"></i>
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors duration-200">
                      {result.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {result.uploader}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatDuration(result.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    data-result-id={result.id}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group-hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSearchResult(result);
                    }}
                  >
                    <i className="fas fa-plus text-gray-500 group-hover:text-blue-500 transition-colors duration-200"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!showSearchResults && searchQuery === "" && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-music text-3xl text-blue-500"></i>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Discover New Music</p>
            <p className="text-gray-400 text-xs">Search for your favorite songs and add them to the queue</p>
          </div>
        )}
      </div>
    </SearchModal>
  );
};

export default SongSearch; 