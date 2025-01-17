import React, { useState, useEffect, useRef } from "react";
import LandingProductList from "./productlistlanding";
import LandingFilterSection from "./filtersectionlanding";
import HeaderLogin from "../../../components/header-login/header-login";
import Footer from "../../../components/footer/footer";
import { FiMenu, FiX } from 'react-icons/fi';
import SpinnerNormal from "../../../components/normalSpinner/normalspinner";
import axioInstence from "../../../utils/axiosConfig";
import axios from "axios";
import LandingShopSearch from "./shopsearchLanding";
import './shoplanding.scss'

export default function LandingShop() {
  const [products, setProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    type: [],
    priceSort: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOffers, setActiveOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const isSearching = useRef(false);

  const applyOffersToProducts = (products, offers) => {
    return products.map(product => {
      const applicableOffer = offers.find(offer => {
        const targetIdStr = offer.targetId?._id?.toString() || offer.targetId?.toString();
        const productIdStr = product._id?.toString();
        const categoryIdStr = product.category?._id?.toString();

        if (offer.applicableTo === 'product' && targetIdStr === productIdStr) {
          return true;
        }
        if (offer.applicableTo === 'category' && targetIdStr === categoryIdStr) {
          return true;
        }
        return false;
      });

      return {
        ...product,
        currentOffer: applicableOffer || null
      };
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [productResponse, offersResponse] = await Promise.all([
        axios.get('http://localhost:3000/user/getproductdatalandingpage'),
        axios.get('http://localhost:3000/user/getactiveofferslandingpage')
      ]);

      const fetchedProducts = productResponse.data;
      const activeOffers = offersResponse.data;

      setActiveOffers(activeOffers);
      const productsWithOffers = applyOffersToProducts(fetchedProducts, activeOffers);
      setProducts(productsWithOffers);

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch products');
      setIsLoading(false);
      console.error('Error fetching products:', err);
    }
  };

  const handleProductsUpdate = (updatedProducts) => {
    // Only update products if we're not in the middle of a search
    if (!isSearching.current) {
      const productsWithOffers = applyOffersToProducts(updatedProducts, activeOffers);
      setProducts(productsWithOffers);
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSearch = async (term) => {
    try {
      setIsLoading(true);
      
      if (!term.trim()) {
        isSearching.current = false;
        await fetchProducts();
      } else {
        isSearching.current = true;
        const response = await axios.get(`http://localhost:3000/user/searchlandingpage?query=${encodeURIComponent(term)}`);
        const productsWithOffers = applyOffersToProducts(response.data, activeOffers);
        setProducts(productsWithOffers);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <HeaderLogin />
        <div className="spinner-loader-layout">
          <SpinnerNormal />
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
          <LandingShopSearch onSearch={handleSearch} />
          <button className={`filter-toggle ${isFilterOpen ? 'open' : ''}`} onClick={toggleFilter}>
            {!isFilterOpen ? <span className="filter-text">FILTER</span> : null}
            {isFilterOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <div className="shop-content">
          <LandingFilterSection 
            activeFilters={activeFilters}
            onProductsUpdate={handleProductsUpdate}
            isOpen={isFilterOpen}
            isSearchActive={isSearching.current}
          />
          <LandingProductList products={products} />
        </div>
      </div>
      <Footer />
    </>
  );
}