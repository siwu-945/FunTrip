import React, { useState } from "react";
import axios from "axios";
import { SearchResult, SearchResponse, PlaylistProps } from "../types/index";

const serverURL = import.meta.env.VITE_SERVER_URL;

interface SongSearchProps {
  handleAddToQueue: (tracks: SpotifyApi.PlaylistTrackObject[]) => void;
}

const SongSearch: React.FC<SongSearchProps> = ({ handleAddToQueue }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");

  const handleSearch = async (sortOverride?: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    try {
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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    if (searchQuery.trim()) {
      handleSearch(newSort);
    }
  };
    // trigger search when enter is pressed
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddSearchResult = (searchResult: SearchResult) => {
    // Convert search result to a format compatible with SpotifyApi.PlaylistTrackObject
    const mockSpotifyTrack: SpotifyApi.PlaylistTrackObject = {
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
      } as any
    };
    handleAddToQueue([mockSpotifyTrack]);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for songs..."
            className="w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
          >
            {isSearching ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-search"></i>
            )}
          </button>
        </div>
      </div>
      {/* Sort Dropdown */}
      <div className="mb-2 flex items-center justify-end">
        <label htmlFor="sort-dropdown" className="mr-2 text-xs text-gray-600">
          Sort by:
        </label>
        <select
          id="sort-dropdown"
          value={sortBy}
          onChange={handleSortChange}
          className="p-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date">Most Recent</option>
          <option value="views">Most Listened</option>
          <option value="alphabetic">A-Z</option>
        </select>
      </div>
      {/* Search Results */}
      {showSearchResults && searchResults.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Empty search results? Let's write a new hit together! Try narrowing your search.
        </div>
      )}
      {showSearchResults && searchResults.length > 0 && (
        <div className="mb-4 bg-white rounded-lg shadow-sm border">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAddSearchResult(result)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0 flex items-center space-x-2">
                    {/* Thumbnail */}
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt="thumbnail"
                        className="w-10 h-10 object-cover rounded shadow border"
                        style={{ minWidth: '2.5rem' }}
                      />
                    ) : (
                      <i className="fas fa-music text-gray-400 text-2xl w-10 h-10 flex items-center justify-center" />
                    )}
                    <div>
                      <p className="text-base font-medium text-gray-900 break-words whitespace-normal">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                        {result.uploader}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDuration(result.duration)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="flex-shrink-0 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSearchResult(result);
                    }}
                  >
                    <i className="fas fa-plus text-base"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongSearch; 