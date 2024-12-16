import React, { useState,useEffect } from "react";
import "./shop.scss";
import FilterSection from "../../../components/shop/filtersection";
import ProductList from "../../../components/shop/productlist";
import HeaderLogin from "../../../components/header-login/header-login";
import Footer from "../../../components/footer/footer";
import { FiMenu, FiX } from 'react-icons/fi';
import axios from 'axios';




export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    type: [],
    priceSort: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchProducts();
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/user/getproductdata');
      
      const fetchedProducts = response.data;
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setIsLoading(false);
    } catch (err) {
      
      setError('Failed to fetch products');
      setIsLoading(false);
      console.error('Error fetching products:', err);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters };

    if (filterType === 'priceSort') {
      newFilters.priceSort = value;
    } else {
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
    }

    setActiveFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filters) => {
    let result = [...products];

    if (filters.category.length > 0) {
      result = result.filter(product => filters.category.includes(product.category));
    }

    if (filters.type.length > 0) {
      result = result.filter(product => filters.type.includes(product.type));
    }

    if (filters.priceSort) {
      result.sort((a, b) => {
        return filters.priceSort === 'lowToHigh' ? a.price - b.price : b.price - a.price;
      });
    }

    setFilteredProducts(result);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  if (isLoading) {
    return (
      <>
        <HeaderLogin />
        <div className="shop">
          <div className="shop-loading">Loading products...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderLogin />
        <div className="shop">
          <div className="shop-error">{error}</div>
        </div>
        <Footer />
      </>
    );
  }

   return (
    <>
      <HeaderLogin />
      <div className="shop">
        <div className="shop-header">
          <h1>Shop</h1>
          <button className="filter-toggle" onClick={toggleFilter}>
            {isFilterOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <div className="shop-content">
          <FilterSection 
            activeFilters={activeFilters} 
            onFilterChange={handleFilterChange} 
            isOpen={isFilterOpen}
          />
          <ProductList products={filteredProducts} />
        </div>
      </div>
      <Footer />
    </>
  );

}

