import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiCheckCircle, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios'; 
import axioInstence from '../../utils/axiosConfig';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/userSlice';

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

function ProductList({ products }) {
  const [displayLimit, setDisplayLimit] = useState(8);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartItemsMap, setCartItemsMap] = useState({});

  const isProductInCart = (productId) => {
    return !!cartItemsMap[productId];
  };

  const handleAddToCart = async (product) => {
    if (isProductInCart(product._id)) {
      toast.info('Product is already in your cart');
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      toast.error('No variants available for this product');
      return;
    }

    const firstVariant = product.variants[0];

    try {
      const cartItem = {
        user: user.id, 
        product: product._id,
        variant: firstVariant,
        quantity: 1,
      };

      const response = await axioInstence.post('/user/addtocart', cartItem);
            if (response.data.itemExists) {
              toast.info('Product is already in your cart');
            } else if(response.data.inSufficientStock){
               toast.info(response.data.message); 
            }else{
            setCartItemsMap(prevMap => ({
              ...prevMap,
              [product._id]: response.data.data
            }));

            toast.success("Successfully added to cart");
          }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
    if (error.response?.status === 403) {
      toast.error('User is Blocked');
      dispatch(logout());
      navigate('/user/login');
      return;
    }
    const errorMessage = 
    error.response?.data?.message || 
    error.message || 
    'Failed to add product to cart';
  
  toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axioInstence.get(`/user/getcartdata/${user.id}`);
        
        // Convert cart items array to a map for easier lookup
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

  const handleShowMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 8);
  };

  const handleProductClick = (productId) => {
    navigate(`/user/product/${productId}`);
  };

  if (!products || products.length === 0) {
    return <div>No products available</div>;
  }

  const displayedProducts = products.slice(0, displayLimit);
  const hasMoreProducts = products.length > displayLimit;

 return (
    <div className="product-list-container">
      <div className="product-list">
        {displayedProducts.map(product => {
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
                onClick={() => handleAddToCart(product)}
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
      {hasMoreProducts && (
        <div className="show-more-container">
          <button 
            className="show-more-button"
            onClick={handleShowMore}
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;