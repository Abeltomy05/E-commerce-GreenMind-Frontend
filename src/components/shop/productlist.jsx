import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios'; 

function ProductList({ products }) {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  
  // State to track cart items for each product
  const [cartItemsMap, setCartItemsMap] = useState({});

  const isProductInCart = (productId) => {
    return !!cartItemsMap[productId];
  };

  const handleAddToCart = async (product) => {
    // Check if product is already in cart
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

      const response = await axios.post('http://localhost:3000/user/addtocart', cartItem);
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
      
      // Check if the error is due to the product already being in cart
      if (error.response && error.response.data.message === 'Product already in cart') {
        toast.info('Product is already in your cart');
      } else {
        toast.error('Failed to add product to cart');
      }
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/getcartdata/${user.id}`);
        
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

  const handleProductClick = (productId) => {
    navigate(`/user/product/${productId}`);
  };

  if (!products || products.length === 0) {
    return <div>No products available</div>;
  }

  return (
    <div className="product-list">
      {products.map(product => {
        const inCart = isProductInCart(product._id);
        
        return (
          <div key={product._id} className="product-card">
            <img 
              src={product.images && product.images.length > 0 
                ? product.images[0] 
                : `/placeholder-image-${product._id}.jpg`} 
              alt={product.name} 
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: 'pointer' }}
            />
            
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="category">{product.category?.name}</p>
              <p className="type">{product.type}</p>
              
              {product.variants && product.variants.length > 0 ? (
                <p className="price">
                  ${product.variants[0].price.toFixed(2)}
                </p>
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
  );
}

export default ProductList;