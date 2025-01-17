import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiCheckCircle, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/userSlice'

const calculateDiscountedPrice = (originalPrice, offer) => {
  if (!offer || !originalPrice || originalPrice <= 0) return originalPrice;
  
  let discountedPrice = originalPrice;

   try {
    if (offer.discountType === 'PERCENTAGE') {
      discountedPrice = originalPrice - (originalPrice * (offer.discountValue / 100));

      if (offer.maxDiscountAmount) {
        const maxDiscountedPrice = originalPrice - offer.maxDiscountAmount;
        discountedPrice = Math.max(discountedPrice, maxDiscountedPrice);
      }
    } else if (offer.discountType === 'FIXED') {
      discountedPrice = Math.max(originalPrice - offer.discountValue, 0);
    }
    
    return Number(discountedPrice.toFixed(2));
  } catch (error) {
    console.error('Error calculating discount:', error);
    return originalPrice;
  }
};

function LandingProductList({ products }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartItemsMap, setCartItemsMap] = useState({});

  const isProductInCart = (productId) => {
    return !!cartItemsMap[productId];
  };

const handleClicks = ()=>{
    toast.info("Login to Continue")
}


  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (!products || products.length === 0) {
    return <div>No products available</div>;
  }

  return (
    <div className="product-list">
      {products.map(product => {
        const inCart = isProductInCart(product._id);

        const hasOffer = Boolean(product.currentOffer);
        
        const originalPrice = product.variants?.[0]?.price || 0;
        const discountedPrice = hasOffer 
          ? calculateDiscountedPrice(originalPrice, product.currentOffer)
          : originalPrice;
        
        const showDiscount = hasOffer && discountedPrice < originalPrice;
        
        return (
          <div key={product._id} className="product-card">

            {hasOffer && (
              <div className="offer-badge">
                <FiTag />
                {product.currentOffer.discountType === 'PERCENTAGE' 
                  ? `${product.currentOffer.discountValue}% OFF`
                  : `₹${product.currentOffer.discountValue} OFF`
                }
              </div>
            )}
            
            <img 
              src={product.images?.[0] || `/placeholder-image-${product._id}.jpg`}
              alt={product.name} 
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: 'pointer' }}
            />
            
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="category">{product.category?.name}</p>
              <p className="type">{product.type}</p>
              
              {product.variants && product.variants.length > 0 ? (
                <div className="price-container">
                  {showDiscount ? (
                    <>
                      <span className="original-price">
                        ₹{originalPrice.toFixed(2)}
                      </span>
                      <span className="discounted-price">
                        ₹{discountedPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="price">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="price">Price not available</p>
              )}
            </div>
            
            <button 
              className={`add-to-cart ${inCart ? 'added' : ''}`}
              onClick={handleClicks}
              disabled={inCart}
            >
              {inCart ? (
                <>
                  <FiCheckCircle /> Added to Cart
                </>
              ) : (
                <>
                  <FiShoppingCart /> Add to Cart
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default LandingProductList;