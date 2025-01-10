import React, { useState, useEffect } from "react";
import "./shop.scss";
import FilterSection from "../../../components/shop/filtersection";
import ProductList from "../../../components/shop/productlist";
import HeaderLogin from "../../../components/header-login/header-login";
import Footer from "../../../components/footer/footer";
import { FiMenu, FiX } from 'react-icons/fi';
import SpinnerNormal from "../../../components/normalSpinner/normalspinner";
import axioInstence from "../../../utils/axiosConfig";

export default function Shop() {
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
  }, [])

  const fetchProducts = async () => {
    try {
      const [productResponse, offersResponse] = await Promise.all([
        axioInstence.get('/user/getproductdata'),
        axioInstence.get('/user/getactiveoffers')
      ]);

      const fetchedProducts = productResponse.data;
      const activeOffers = offersResponse.data;

      console.log('Active offers:', activeOffers);

      setActiveOffers(activeOffers);

      const productsWithOffers = applyOffersToProducts(fetchedProducts, activeOffers);
      setProducts(productsWithOffers);


      setTimeout(() => {
        setIsLoading(false);
      }, 1000)
     
    } catch (err) {
      setError('Failed to fetch products');
      setIsLoading(false);
      console.error('Error fetching products:', err);
    }
  };

  const handleProductsUpdate = (updatedProducts) => {
    const productsWithOffers = applyOffersToProducts(updatedProducts, activeOffers);
    setProducts(productsWithOffers);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
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
    )
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
          <button className={`filter-toggle ${isFilterOpen ? 'open' : ''}`} onClick={toggleFilter}>
            {!isFilterOpen ? <span className="filter-text">FILTER</span> : null}
            {isFilterOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <div className="shop-content">
          <FilterSection 
            activeFilters={activeFilters} 
            onProductsUpdate={handleProductsUpdate} 
            isOpen={isFilterOpen}
          />
          <ProductList products={products} />
        </div>
      </div>
      <Footer />
    </>
  );
}
