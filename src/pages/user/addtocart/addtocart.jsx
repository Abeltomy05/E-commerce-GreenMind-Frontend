import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import './addtocart.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setSelectedItems,updateCartCount} from '../../../redux/cartSlice';
import BasicPagination from '../../../components/pagination/pagination';

const CartPage = () => {
 
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(3);

  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const pageCount = Math.ceil(cartItems.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const currentOrders = cartItems.slice(startIndex, startIndex + ordersPerPage);


  const handleNavigate = (path) => {
    
    const selectedItems = cartItems.filter(item => item.checked);
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    dispatch(setSelectedItems({ selectedItems, total })); 
  
    navigate(path);
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/user/getcartdataforcartpage/${user.id}`);
      const cartCount = response.data.data.length;
      dispatch(updateCartCount(cartCount))
      const formattedItems = response.data.data.map(item => ({
        ...item,
        quantity: item.quantity < 1 ? 1 : item.quantity, 
        checked: true 
      }));
      setCartItems(formattedItems);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to load cart items');
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCartItems();
  }, []);


  useEffect(() => {
    const newSubtotal = cartItems.reduce((sum, item) => 
      item.checked ? sum + item.price * item.quantity : sum, 0
    );
    setSubtotal(newSubtotal);
  }, [cartItems]);



  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await axios.patch(`http://localhost:3000/user/updatequantity/${id}`, 
        {
          quantity: newQuantity,
          userId: user.id
        }
      );
  
      if (response.data.success) {
        const updatedItems = cartItems.map(item =>
          item.id === id 
            ? { 
                ...item, 
                quantity: response.data.data.quantity,
                availableStock: response.data.availableStock 
              } 
            : item
        );

        setCartItems(updatedItems);
  
        if (response.data.availableStock <= 5) {
          toast.warning(`Only ${response.data.availableStock} items left in stock!`);
        }
      } else {
        toast.error(response.data.message || 'Failed to update quantity');
      }
  
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update quantity');
      } else if (error.request) {
        toast.error('No response from server');
      } else {
        toast.error('Error updating quantity');
      }
    }
  };

  const removeItem = async (id) => {     
    try {       
      const response = await axios.delete(`http://localhost:3000/user/removecartitem/${id}`, {
        data: { userId: user.id }  // Correctly pass userId in the request body
      });  

      const updatedItems = cartItems.filter(item => item.id !== id);
      setCartItems(updatedItems);    
      dispatch(setCartItems(updatedItems));

    if(response.data.success){         
        toast.info(response.data.message || "Product removed from cart")       
      }            
    } catch (error) {       
      console.error('Error removing item:', error);       
      toast.error("Error removing cart item")     
    }   
  };

  const toggleItemCheck = (id) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <HeaderLogin/>
      <div className="cart-page">
        <div className="cart-content">
          <div className="cart-items">
            <h1>Shopping Cart</h1>
            
            {currentOrders.length === 0 ? (
              <div className="empty-cart">
                <p>No items in your cart</p>
                <button className="continue-shopping-btn" onClick={()=>navigate('/user/shop')}>
                  <ArrowLeft size={20} />
                  Continue Shopping
                </button>
              </div>
            ) : (
              currentOrders.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-checkbox">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItemCheck(item.id)}
                      id={`checkbox-${item.id}`}
                    />
                    <label htmlFor={`checkbox-${item.id}`}>
                      <Check size={16} />
                    </label>
                  </div>
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                    <p className="item-size">Size:{item.size}</p>
                  </div>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                  <button className="remove-item" onClick={() => removeItem(item.id)}>
                    <X size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {currentOrders.length > 0 && (
            <div className="cart-summary">
              <h2>Cart Total</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={()=>handleNavigate('/user/checkout')}>
                <ShoppingBag size={20} />
                Proceed to Checkout
              </button>
              <button className="continue-shopping-btn">
                <ArrowLeft size={20} />
                Continue Shopping
              </button>
            </div>
          )}
        </div>
        {pageCount > 1 && (
                  <div className="mt-6 flex justify-center">
                    <BasicPagination count={pageCount} onChange={handlePageChange} />
                  </div>
                )}
      </div>
      <Footer/>
    </>
  );
};

export default CartPage;
