import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import './addtocart.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const CartPage = () => {
 
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth.user);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/user/getcartdataforcartpage/${user.id}`);

      const formattedItems = response.data.data.map(item => ({
        ...item,
        checked: true 
      }));
     console.log(formattedItems)
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
    try {
      await axios.patch(`http://localhost:3000/user/updatequantity/${id}`, 
        {
           quantity: newQuantity,
           userId: user.id
        }
      );

      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      
    }
  };


  const removeItem = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/user/removecartitem/${id}`);

      setCartItems(cartItems.filter(item => item.id !== id));
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
          {cartItems.map((item) => (
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
          ))}
        </div>
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
          <button className="checkout-btn">
            <ShoppingBag size={20} />
            Proceed to Checkout
          </button>
          <button className="continue-shopping-btn">
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CartPage;

