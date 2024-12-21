import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import axios from 'axios';

function FilterSection({ isOpen, onProductsUpdate }) {
  const [openSection, setOpenSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    type: [],
    priceSort: null,
    nameSort: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const categoryResponse = await axios.get('http://localhost:3000/user/getcategorynames');
        const categoryData = categoryResponse.data.data.map(category => category.name);
        setCategories(categoryData);

        const typesResponse = await axios.get('http://localhost:3000/user/producttypes');
        setTypes(typesResponse.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching filters:', err);
        setError('Failed to load filters');
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedFilters.category.length) params.append('category', selectedFilters.category.join(','));
        if (selectedFilters.type.length) params.append('type', selectedFilters.type.join(','));
        if (selectedFilters.priceSort) params.append('priceSort', selectedFilters.priceSort);
        if (selectedFilters.nameSort) params.append('nameSort', selectedFilters.nameSort);

        const response = await axios.get(`http://localhost:3000/user/productsfilter?${params}`);
        onProductsUpdate(response.data.data);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      }
    };

    fetchFilteredProducts();
  }, [selectedFilters, onProductsUpdate]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const updatedFilters = { ...prev };
      if (filterType === 'priceSort' || filterType === 'nameSort') {
        updatedFilters[filterType] = value === prev[filterType] ? null : value;
      } else {
        if (!Array.isArray(updatedFilters[filterType])) {
          updatedFilters[filterType] = [];
        }
        const index = updatedFilters[filterType].indexOf(value);
        if (index > -1) {
          updatedFilters[filterType].splice(index, 1);
        } else {
          updatedFilters[filterType].push(value);
        }
      }
      return updatedFilters;
    });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (loading) return <div className="p-4 text-center">Loading filters...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className={`filter-section bg-[] rounded-lg shadow-md p-6 ${isOpen ? 'open' : ''}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filters</h2>
      
      <div className="filter-group mb-6">
        <h3 
          className="flex justify-between items-center text-lg font-semibold text-gray-700 cursor-pointer"
          onClick={() => toggleSection('category')}
        >
          Category {openSection === 'category' ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
        {openSection === 'category' && (
          <div className="filter-options mt-3 space-y-2">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2 text-white-600 ">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-500"
                  checked={selectedFilters.category.includes(category)}
                  onChange={() => handleFilterChange('category', category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group mb-6">
        <h3 
          className="flex justify-between items-center text-lg font-semibold text-gray-700 cursor-pointer"
          onClick={() => toggleSection('type')}
        >
          Type {openSection === 'type' ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
        {openSection === 'type' && (
          <div className="filter-options mt-3 space-y-2">
            {types.map(type => (
              <label key={type} className="flex items-center space-x-2 text-white-600 ">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-500"
                  checked={selectedFilters.type.includes(type)}
                  onChange={() => handleFilterChange('type', type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group mb-6">
        <h3 className="text-lg font-semibold text-white-700 mb-3">Sort</h3>
        
        <div className="mb-4">
          <h4 className="text-md font-medium text-white-600 mb-2">Price</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-white-600 ">
              <input
                type="radio"
                className="form-radio text-blue-500"
                name="priceSort"
                checked={selectedFilters.priceSort === 'lowToHigh'}
                onChange={() => handleFilterChange('priceSort', 'lowToHigh')}
              />
              <span>Low to High</span>
            </label>
            <label className="flex items-center space-x-2 text-white-600 ">
              <input
                type="radio"
                className="form-radio text-blue-500"
                name="priceSort"
                checked={selectedFilters.priceSort === 'highToLow'}
                onChange={() => handleFilterChange('priceSort', 'highToLow')}
              />
              <span>High to Low</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-white-600 mb-2">Name</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-white-600 ">
              <input
                type="radio"
                className="form-radio text-blue-500"
                name="nameSort"
                checked={selectedFilters.nameSort === 'aToZ'}
                onChange={() => handleFilterChange('nameSort', 'aToZ')}
              />
              <span>A to Z</span>
            </label>
            <label className="flex items-center space-x-2 text-white-600 ">
              <input
                type="radio"
                className="form-radio text-blue-500"
                name="nameSort"
                checked={selectedFilters.nameSort === 'zToA'}
                onChange={() => handleFilterChange('nameSort', 'zToA')}
              />
              <span>Z to A</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterSection;

