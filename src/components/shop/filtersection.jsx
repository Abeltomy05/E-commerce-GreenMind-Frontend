import React, { useState } from 'react';
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function FilterSection({ activeFilters, onFilterChange, isOpen, onClose }) {
  const [openSection, setOpenSection] = useState(null);

  const categories = ['Natural plant', 'Artificial plant', 'Plant accessorie'];
  const types = ['Indoor', 'Outdoor', 'Hanging', 'Desktop'];

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className={`filter-section ${isOpen ? 'open' : ''}`}>
      
      <h2>Filters</h2>
      
      <div className="filter-group">
        <h3 onClick={() => toggleSection('category')}>
          Category {openSection === 'category' ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
        {openSection === 'category' && (
          <div className="filter-options">
            {categories.map(category => (
              <label key={category} className="filter-item">
                <input
                  type="checkbox"
                  checked={activeFilters.category.includes(category)}
                  onChange={() => onFilterChange('category', category)}
                />
                {category}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <h3 onClick={() => toggleSection('type')}>
          Type {openSection === 'type' ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
        {openSection === 'type' && (
          <div className="filter-options">
            {types.map(type => (
              <label key={type} className="filter-item">
                <input
                  type="checkbox"
                  checked={activeFilters.type.includes(type)}
                  onChange={() => onFilterChange('type', type)}
                />
                {type}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <h3 onClick={() => toggleSection('price')}>
          Price {openSection === 'price' ? <FiChevronUp /> : <FiChevronDown />}
        </h3>
        {openSection === 'price' && (
          <div className="filter-options">
            <label className="filter-item">
              <input
                type="radio"
                name="priceSort"
                checked={activeFilters.priceSort === 'lowToHigh'}
                onChange={() => onFilterChange('priceSort', 'lowToHigh')}
              />
              Low to High
            </label>
            <label className="filter-item">
              <input
                type="radio"
                name="priceSort"
                checked={activeFilters.priceSort === 'highToLow'}
                onChange={() => onFilterChange('priceSort', 'highToLow')}
              />
              High to Low
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterSection;

