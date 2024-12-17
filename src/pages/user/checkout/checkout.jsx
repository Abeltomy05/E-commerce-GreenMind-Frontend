import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import './checkout.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import razorpaylogo from '../../../assets/images/Razorpay_logo.webp'
import axios from 'axios';
import { useSelector } from 'react-redux';

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [showAllAddresses, setShowAllAddresses] = useState(false);


  const { selectedItems, total } = useSelector((state) => state.cart);
  const user = useSelector((state)=>state.auth.user)


  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      navigate('/user/cart');
    }
  }, [selectedItems,navigate]);

  useEffect(()=>{
    const fetchUserAddresses = async() =>{
      try{
        const response = await axios.get(`http://localhost:3000/user/addressdata/${user.id}`);
        const sortedAddresses = response.data.sort((a, b) => b.isDefault - a.isDefault);
        setAddresses(sortedAddresses);
        setIsLoading(false);

        const defaultAddress = sortedAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (sortedAddresses.length > 0) {
          setSelectedAddress(sortedAddresses[0]);
        }
      }catch(err){
        setError(err.message);
        setIsLoading(false);
        console.error('Failed to fetch addresses:', err);
      }
    }

    if (user?.id) {
      fetchUserAddresses();
    }

  },[user])


  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // const total = subtotal; 

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleCardDetailsChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order submitted', { selectedAddress, paymentMethod, cardDetails, couponCode });
  };

  if (isLoading) {
    return <div>Loading addresses...</div>;
  }

  if (error) {
    return <div>Error loading addresses: {error}</div>;
  }

  const visibleAddresses = showAllAddresses ? addresses : addresses.slice(0, 2);

  return (
    <>
      <HeaderLogin />
      <div className="checkout-page">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-left">
            <section className="checkout-section">
              <h2>Shipping Address</h2>
              <div className="address-list">
                {visibleAddresses.map(address => (
                  <div
                    key={address.id}
                    className={`address-item ${selectedAddress === address ? 'selected' : ''}`}
                  >
                    <label className="address-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedAddress === address}
                        onChange={() => handleAddressSelect(address)}
                      />
                      <span className="checkmark"></span>
                      
                    </label>
                    <div className="address-details">
                        <div className="defaulttagbox">
                          <h3>{address.fullName}</h3>
                          {address.isDefault && <span className="default-tag">Default</span>}
                          </div>
                          <p>{address.Address}</p>
                          <p>
                            {address.city}, {address.district}
                          </p>
                          <p>
                            {address.state} - {address.pincode}
                          </p>
                          <p>
                            Phone: {address.phone}
                          </p>
                          <p>
                            Country: {address.country}
                          </p>
                        </div>
                  </div>
                ))}
              </div>
              {addresses.length > 2 && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowAllAddresses(!showAllAddresses)}
                >
                  {showAllAddresses ? (
                    <>
                      <ChevronUp />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown />
                      Show More
                    </>
                  )}
                </button>
              )}
            </section>

            <section className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <div
                  className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect('cod')}
                >
                  <Truck />
                  <span>Cash on Delivery</span>
                </div>
                <div
                  className={`payment-option ${paymentMethod === 'credit-card' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect('credit-card')}
                >
                  <CreditCard />
                  <span>Credit Card</span>
                </div>
                <div
                  className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect('razorpay')}
                >
                  <img src={razorpaylogo} alt="Razorpay" />
                  <span>Razorpay</span>
                </div>

                {paymentMethod === 'credit-card' && (
                  <div className="credit-card-form">
                    <input
                      type="text"
                      name="number"
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={handleCardDetailsChange}
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Cardholder Name"
                      value={cardDetails.name}
                      onChange={handleCardDetailsChange}
                    />
                    <div className="card-extra-details">
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={handleCardDetailsChange}
                      />
                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={handleCardDetailsChange}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <p className="cod-message">You can pay when the product is delivered.</p>
                )}
              </div>
            </section>
          </div>

          <div className="checkout-right">
            <section className="checkout-section">
              <h2>Order Summary</h2>
              <div className="order-summary">
                <div className="cart-items">
                  {selectedItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-quantity">x{item.quantity}</span>
                      <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="coupon-section">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={handleCouponChange}
                  />
                  <button className="apply-coupon">
                    <Tag />
                    Apply
                  </button>
                </div>
                <div className="order-totals">
                  <div className="subtotal">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="shipping">
                    <span>Shipping</span>
                    <span className="free-shipping">FREE</span>
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button className="proceed-payment" onClick={handleSubmit}>Place Order</button>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
