import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import './productView.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { CarTaxiFront } from 'lucide-react';
import axiosInstance from '../../../utils/axiosConfig';
import {logout} from '../../../redux/userSlice'
import { useDispatch } from 'react-redux';

const ProductView = () => {
  const { productId } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Predefined sizes to always show
  const STANDARD_SIZES = ['S', 'M', 'L'];
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

 useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axiosInstance.get(`/user/getcartdata/${user.id}`);
        const cartMap = response.data.items.reduce((map, item) => {
          map[item.product] = item;
          return map;
        }, {});
        setCartItemsMap(cartMap);
        
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    if (user.id) {
      fetchCartItems();
    }
  }, [user.id]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axiosInstance.get(`/user/product-view/${productId}`);
        const productData = response.data;


        if (productData.variants && productData.variants.length > 0) {
          const availableVariant = productData.variants.find(variant => variant.stock > 0) 
            || productData.variants[0];
          setSelectedVariant(availableVariant);
        }

        setProduct(productData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const response = await axiosInstance.get(`/user/check-wishlist/${product._id}`);
        setIsInWishlist(response.data.isInWishlist);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
  
    if (product && user.id) {
      checkWishlist();
    }
  }, [product, user.id]);

  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value));
    setQuantity(newQuantity);
  };

  const toggleFavorite = async () => {
    if (!user.id) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      if (isInWishlist) {
        await axiosInstance.delete(`/user/remove-wishlist/${product._id}`);
        toast.success('Removed from wishlist');
      } else {
        const response = await axiosInstance.post('/user/add-wishlist', {
          product: product._id
        });
        toast.success('Added to wishlist');

      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || 'Account has been blocked');
        dispatch(logout());
        navigate('/user/login');
      }
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleSizeSelection = (size) => {
    const variant = product.variants.find(v => v.size === size);
    setSelectedVariant(variant);
    setQuantity(1); 
  };

  const isProductInCart = (productToCheck) => {
    if (!cartItemsMap || Object.keys(cartItemsMap).length === 0) {
      return false;
    }
  
    return Object.values(cartItemsMap).some(cartItem => 
      cartItem.product === productToCheck.productId && 
      cartItem.variant?.size === productToCheck.size
    );
  };

  const handleAddToCart = async() => {
    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error('Please select an available size');
      return;
    }
    const cartItem = {
      productId: product._id,
      size: selectedVariant.size,
      quantity,
    };
    if (isProductInCart(cartItem)) {
      toast.info('Product already in cart');
      return;
    }
    try {
      const response = await axiosInstance.post('/user/addtocart', {
        user:user.id,
        product: product._id,
        variant: {
          size: selectedVariant.size,
          price: selectedVariant.price
        },
        quantity,
      });

      if (response.data.itemExists) {
        toast.info('Product already in cart');
      } else if(response.data.inSufficientStock){
        toast.info(response.data.message);  
      }else{
        toast.success('Product added to cart');
      }

    } catch (err) {
      if (err.response?.status !== 403 && !err.response?.data?.cartLimitReached) {
              toast.error('Failed to add product to cart');
            }
          
          setError(err.response?.data?.message || err.message);
          toast.error(err.response?.data?.message || err.message);
      
       if (err.response?.status === 403) {
            dispatch(logout());
            navigate('/user/login');
          }
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error('Please select an available size');
      return;
    }
    console.log('Buy now:', {
      productId: product._id,
      size: selectedVariant.size,
      quantity,
      price: selectedVariant.price
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % product.images.length
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>No product found</div>;

  return (
    <>
      <HeaderLogin />
      <div className="product-container">
        <div className="product-view">
          <div className="product-gallery">
          <div className="main-image-container" ref={imageContainerRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsZoomed(true)} onMouseLeave={() => setIsZoomed(false)}>
          <div 
             className={`image-wrapper ${isZoomed ? 'zoomed' : ''}`}
             style={{
                backgroundImage: `url(${product.images[currentImageIndex]})`,
                backgroundPosition: isZoomed 
                    ? `${mousePosition.x}% ${mousePosition.y}%` 
                    : 'center',
                backgroundSize: isZoomed ? '200%' : 'cover'
              }}
           >
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name} 
                className="main-product-image" 
                onClick={toggleZoom}
              />

              <button className="favorite-btn" onClick={toggleFavorite}>
                {isInWishlist  ? <FaHeart size={30}/> : <FaRegHeart size={25}/>}
              </button>
              <div className="image-navigation">
                <button 
                  className="nav-btn prev" 
                  onClick={handlePrevImage}
                >
                  &lt;
                </button>
                <button 
                  className="nav-btn next" 
                  onClick={handleNextImage}
                >
                  &gt;
                </button>
              </div>
              </div>
            </div>
            <div className="thumbnail-container">
            {product.images && product.images.length > 0 ? (
              product.images.slice(0, 4).map((image, index) => (
               image && ( <div 
                  key={index} 
                  className={`thumbnail-wrapper ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    className="thumbnail"
                  />
                </div>
               )
              ))
              ) :null}
            </div>
            <div className="stock-info">
              Stock: {selectedVariant ? selectedVariant.stock : 'N/A'} items available
            </div>
          </div>
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-rating">
              {[...Array(5)].map((_, index) => (
                <FaStar key={index} className={index < 3 ? 'filled' : ''} />
              ))}
              <span className="rating-text">3.0 (0 REVIEWS)</span>
            </div>
            <div className="product-price">
              <span className="current-price">
                ${selectedVariant ? selectedVariant.price.toFixed(2) : product.variants[0].price.toFixed(2)}
              </span>
              <span className="original-price">
                ${(selectedVariant ? selectedVariant.price : product.variants[0].price * 1.2).toFixed(2)}
              </span>
            </div>
            <p className="product-description">{product.description}</p>
            <div className="product-info">
              <div className="info-section">
                <h3>Details</h3>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{product.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span className="value">{product.category?.name}</span>
                </div>
                {product.brand && (
                  <div className="detail-row">
                    <span className="label">Brand:</span>
                    <span className="value">{product.brand}</span>
                  </div>
                )}
              </div>
              <div className="info-section">
                <h3>Available Sizes</h3>
                <div className="size-options">
                  {STANDARD_SIZES.map(standardSize => {
                    const variant = product.variants.find(v => v.size === standardSize);
                    const isAvailable = variant && variant.stock > 0;
                    
                    return (
                      <label 
                        key={standardSize} 
                        className={`size-option ${selectedVariant?.size === standardSize ? 'selected' : ''} ${!isAvailable ? 'inactive' : ''}`}
                      >
                        <input
                          type="radio"
                          name="size"
                          value={standardSize}
                          checked={selectedVariant?.size === standardSize}
                          onChange={() => isAvailable && handleSizeSelection(standardSize)}
                          disabled={!isAvailable}
                        />
                        {standardSize}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            {selectedVariant && (
              <div className="quantity-section">
                <div className="quantity-selector">
                  <button onClick={() => handleQuantityChange({ target: { value: quantity - 1 } })}>-</button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e)}
                    min="1"
                    max="20"
                  />
                  <button onClick={() => handleQuantityChange({ target: { value: quantity + 1 } })}>+</button>
                </div>
                <span className="stock-status">
                  {selectedVariant?.stock > 0 ? (
                    <span className="in-stock">Available Now</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </span>
              </div>
            )}
            <div className="action-buttons">
            {/* <button 
                className="buy-now-btn" 
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                BUY NOW
              </button> */}
              <button 
                className="add-to-cart-btn" 
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductView;