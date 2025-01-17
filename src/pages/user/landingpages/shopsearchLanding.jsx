import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiClock, FiX } from 'react-icons/fi';

const LandingShopSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (trimmedTerm) {
      const updatedSearches = [
        trimmedTerm,
        ...recentSearches.filter(s => s !== trimmedTerm)
      ].slice(0, 5);

      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      onSearch(trimmedTerm);
      setShowRecentSearches(false); 
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const selectRecentSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
    setShowRecentSearches(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setShowRecentSearches(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-container relative" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="flex items-center">
        <FiSearch className="absolute left-3 text-gray-500" />
        <input
          type="text"
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => setShowRecentSearches(true)}
        />

          <button
            type="button"
            className="absolute right-3 text-gray-500 hover:text-gray-700"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <FiX />
          </button>

      </form>

      {recentSearches.length > 0 && showRecentSearches && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {recentSearches.map((term, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => selectRecentSearch(term)}
            >
              <FiClock className="mr-2 text-gray-500" />
              <span>{term}</span>
            </div>
          ))}
          <div
            className="px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer border-t"
            onClick={clearRecentSearches}
          >
            Clear recent searches
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingShopSearch;