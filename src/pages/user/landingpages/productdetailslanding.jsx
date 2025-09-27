import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaHeart, FaRegHeart} from 'react-icons/fa';
import {FiTag} from 'react-icons/fi'
import './productdetailslanding.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CarTaxiFront } from 'lucide-react';
import {logout} from '../../../redux/userSlice'
import { useDispatch } from 'react-redux';



const LandingProductView = () => {
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
  const [currentPrice, setCurrentPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Predefined sizes to always show
  const STANDARD_SIZES = ['S', 'M', 'L'];
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const calculateOfferPrice = (variant, offer) => {
    if (!offer || !variant) return variant?.price || 0;
    
    const originalPrice = variant.price;
    if (offer.discountType === 'PERCENTAGE') {
      let discountAmount = (originalPrice * offer.discountValue) / 100;
      if (offer.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, offer.maxDiscountAmount);
      }
      return Math.max(originalPrice - discountAmount, 0);
    } else if (offer.discountType === 'FIXED') {
      return Math.max(originalPrice - offer.discountValue, 0);
    }
    return originalPrice;
  };
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        if (product?.category?._id) {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/related-productslandingpage/${product.category._id}/${productId}`);
          setRelatedProducts(response.data); 
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  useEffect(() => {
    if (selectedVariant && product?.currentOffer) {
      const variantPrice = selectedVariant.price;
      setCurrentPrice(variantPrice);
      
      if (selectedVariant.offerPrice !== undefined) {
        setDiscountedPrice(selectedVariant.offerPrice);
      } else {
        const calculated = calculateOfferPrice(selectedVariant, product.currentOffer);
        setDiscountedPrice(calculated);
      }
    } else if (selectedVariant) {
      setCurrentPrice(selectedVariant.price);
      setDiscountedPrice(selectedVariant.price);
    }
  }, [selectedVariant, product?.currentOffer]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/product-viewlandingpage/${productId}`);
        const productData = response.data;
        console.log(productData)
  

        let initialVariant = null;
        if (productData.variants && productData.variants.length > 0) {
          initialVariant = productData.variants.find(variant => variant.stock > 0) 
            || productData.variants[0];
          setSelectedVariant(initialVariant);
          
          if (initialVariant) {
            setCurrentPrice(initialVariant.price);

            setDiscountedPrice(initialVariant.discountedPrice || initialVariant.price);
          }
        }

        setProduct(productData);
      setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    if (selectedVariant && product?.currentOffer) {
      console.log('Updating prices with variant:', selectedVariant); 
      console.log('Current offer:', product.currentOffer); 

      const variantPrice = selectedVariant.price;
      setCurrentPrice(variantPrice);
      
      const calculated = calculateDiscountedPrice(variantPrice, product.currentOffer);
      setDiscountedPrice(calculated);
    }
  }, [selectedVariant, product?.currentOffer]);
  

  const calculateDiscountedPrice = (originalPrice, offer) => {
    console.log('Calculating discount with:', { originalPrice, offer }); 
    if (!offer || !originalPrice) {
      console.log('No offer or price, returning original:', originalPrice);
      return originalPrice;
    }
    
    let discountedPrice = originalPrice;
    
    try {
      if (offer.discountType === 'PERCENTAGE') {
        const discountAmount = originalPrice * (offer.discountValue / 100);
        console.log('Calculated discount amount:', discountAmount);

        if (offer.maxDiscountAmount) {
          const cappedDiscount = Math.min(discountAmount, offer.maxDiscountAmount);
          discountedPrice = originalPrice - cappedDiscount;
          console.log('Applied capped discount:', cappedDiscount);
        } else {
          discountedPrice = originalPrice - discountAmount;
        }
      } else if (offer.discountType === 'FIXED') {
        discountedPrice = Math.max(originalPrice - offer.discountValue, 0);
      }

      discountedPrice = Math.max(discountedPrice, 0);
      console.log('Final discounted price:', discountedPrice);

      return Math.round(discountedPrice * 100) / 100;
    } catch (error) {
      console.error('Error calculating discount:', error);
      return originalPrice;
    }
  };

  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value));
    setQuantity(newQuantity);
  };


  const handleSizeSelection = (size) => {
    const variant = product.variants.find(v => v.size === size);
  setSelectedVariant(variant);
  setQuantity(1); 
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

  const handleclick = ()=>{
    toast.info('Login to continue')
  }

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

              <button className="favorite-btn" onClick={handleclick}>
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

            {/* {product.currentOffer && (
              <div className="offer-banner">
                <FiTag className="offer-icon" />
                <div className="offer-details">
                  <span className="offer-title">{product.currentOffer.name}</span>
                  <span className="offer-value">
                    {product.currentOffer.discountType === 'PERCENTAGE' 
                      ? `${product.currentOffer.discountValue}% OFF`
                      : `$${product.currentOffer.discountValue} OFF`
                    }
                  </span>
                  <span className="offer-validity">
                    Valid till {new Date(product.currentOffer.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )} */}



            {selectedVariant && (
            <div className="product-price">
              {product?.currentOffer ? (
                <>
                  <span className="original-price line-through">
                    ₹{currentPrice.toFixed(2)}
                  </span>
                  <span className="discounted-price">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  <span className="savings">
                    You save: ₹{(currentPrice - discountedPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="current-price">
                  ₹{currentPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}



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
                onClick={handleclick}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
          {/* Related Products Section */}
          {relatedProducts.length < 1? null :(
          <div className="related-products-section px-4 py-8">
      <h2 className="section-title text-2xl font-bold text-center mb-8">Related Products</h2>
      <div className="flex justify-center w-full">
        <div className="grid w-full max-w-7xl justify-items-center"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, 280px)',
            gap: '1.5rem',
            justifyContent: 'center'
          }}>
          {relatedProducts.map((relatedProduct) => {
            const mainVariant = relatedProduct.variants[0];
            const hasOffer = mainVariant.offerPrice !== undefined;

            return (
              <div 
                key={relatedProduct._id} 
                className="related-product-card w-[280px] bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-100 hover:shadow-xl"
              >
                <div className="product-image aspect-square overflow-hidden cursor-pointer"
                onClick={handleclick}>
                  <img 
                    src={relatedProduct.images[0]} 
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="product-info p-6">
                  <h3 className="product-name text-xl font-semibold mb-2 truncate">
                    {relatedProduct.name}
                  </h3>
                  <p className="product-category text-sm text-gray-600 mb-4">
                    {relatedProduct.category?.name}
                  </p>
                  <div className="product-price flex items-center gap-3">
                    {hasOffer ? (
                      <>
                        <span className="original-price line-through text-gray-500">
                          ₹{mainVariant.originalPrice || mainVariant.price}
                        </span>
                        <span className="discounted-price text-xl font-bold text-green-600">
                          ₹{mainVariant.offerPrice}
                        </span>
                        {mainVariant.discountPercentage && (
                          <span className="discount-tag bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                            {mainVariant.discountPercentage}% OFF
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="current-price text-xl font-bold">
                        ₹{mainVariant.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </div>
          )}
      </div>
      <Footer />
    </>
  );
};

export default LandingProductView;