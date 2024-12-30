import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Tag, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import './checkout.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import razorpaylogo from '../../../assets/images/Razorpay_logo.webp'
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelectedItems } from '../../../redux/cartSlice';
import { toast } from 'react-toastify';
import Loader from '../../../components/loader/loader';
import axioInstence from '../../../utils/axiosConfig';

const OrderSuccessOverlay = ({ orderId, totalAmount, onContinueShopping, onViewOrderDetails, onClose }) => {
  const formattedAmount = Number(totalAmount || 0).toFixed(2);
  return (
    <div className="order-success-overlay">
      <div className="order-success-content">
        <CheckCircle size={100} color="green" className='checkcircle'/>
        <h1>Order Placed Successfully!</h1>
        <div className="order-details">
          <p>Order Number: <strong>{orderId}</strong></p>
          <p>Total Amount: <strong>${formattedAmount}</strong></p>
        </div>
        <div className="order-success-actions">
          <button 
            className="continue-shopping-btn" 
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>
          <button 
            className="view-order-details-btn" 
            onClick={onViewOrderDetails}
          >
            View Order Details
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
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
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      navigate('/user/cart');
    }
  }, [selectedItems, navigate]);

  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const response = await axioInstence.get(`/user/addressdata/${user.id}`);
        const sortedAddresses = response.data.sort((a, b) => b.isDefault - a.isDefault);
        setAddresses(sortedAddresses);
        setIsLoading(false);

        const defaultAddress = sortedAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (sortedAddresses.length > 0) {
          setSelectedAddress(sortedAddresses[0]);
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        console.error('Failed to fetch addresses:', err);
      }
    }

    if (user?.id) {
      fetchUserAddresses();
    }
  }, [user]);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  const handleContinueShopping = () => {
    navigate('/user/shop');
    dispatch(clearSelectedItems());
  };

  const handleViewOrderDetails = () => {
 navigate(`/user/orderdetails/${orderSuccessData.orderId}`)
  };

  // const handleCloseOrderSuccess = () => {
  //   setOrderSuccessData(null);
  // };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpaySuccess = useCallback(async (paymentResponse, orderData, orderAmount) => {
    try {

      const paymentVerification = await axioInstence.post('/payment/razorpaypaymentverify', {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        orderDetails: orderData
      });

      if (!paymentVerification.data.success) {
        throw new Error('Payment verification failed');
      }

      const finalOrderData = {
        ...orderData,
        paymentDetails: {
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
        },
        totalPrice: orderAmount,
        paymentMethod: 'razorpay',
        paymentStatus: 'PENDING'
      };

      const orderResponse = await axioInstence.post('/user/razorpayplaceorder', finalOrderData);
      
      if (!orderResponse.data.success) {
        throw new Error('Failed to save order');
      }


      // Update state and show success overlay
      setOrderSuccessData({
        orderId: orderResponse.data.orderId,
        totalAmount: orderAmount
      });
      
      dispatch(clearSelectedItems());
      toast.success('Order placed successfully!');
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
        setIsOrderProcessing(false);
    }
  }, [dispatch]);

  const initializeRazorpayPayment = async (orderData) => {
    try {
      setIsOrderProcessing(true);
      const res = await loadRazorpayScript();
      
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        setIsOrderProcessing(false); 
        return;
      }

      const orderPayload = {
        products: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size
        })),
        couponCode: couponCode || null
      };

      const response = await axioInstence.post('/payment/razorpay', orderPayload);
      
      if (!response.data.success) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: "Green Mind",
        description: "Payment for your order",
        order_id: response.data.order.id,
        handler: async function (paymentResponse) {
          await handleRazorpaySuccess(
            paymentResponse, 
            orderData, 
            response.data.order.amount / 100
          );
        },
        prefill: {
          name: selectedAddress?.fullName || "",
          email: user?.email || "",
          contact: selectedAddress?.phone || ""
        },
        theme: {
          color: "#3399cc"
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Razorpay payment initialization failed:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsOrderProcessing(false);
    }
  };

  //Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.info('Please select a shipping address');
      return;
    }

    if (!paymentMethod) {
      toast.info('Please select a payment method');
      return;
    }

    // setOrderSuccessData(null);

    const orderData = {
      userId: user.id,
      products: selectedItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        size: item.size,
        cartItemId: item.id
      })),
      addressId: selectedAddress._id,
      totalPrice: total,
      paymentMethod: paymentMethod,
      couponCode: couponCode || null,
    };
    

    try {
      if (paymentMethod === 'cod') {
        setIsOrderProcessing(true);
        // For COD, get the final amount from server first
        const amountResponse = await axioInstence.post('/user/calculateOrderAmount', {
          products: orderData.products,
          couponCode: orderData.couponCode
        });
        
        const response = await axioInstence.post('/user/placeorder', {
          ...orderData,
          totalPrice: amountResponse.data.data.totalAmount
        });
        setTimeout(()=>{
          setIsOrderProcessing(false);
          setOrderSuccessData({
            orderId: response.data.orderId,
            totalAmount: amountResponse.data.data.totalAmount
          });
        },3000)
      
      } 
      else if (paymentMethod === 'razorpay') {
        await initializeRazorpayPayment(orderData);
      }
      else if (paymentMethod === 'credit-card') {
       console.log('Credit card payment method selected');
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      toast.error('Failed to place order. Please try again.');
      setIsOrderProcessing(false);
    }

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
      {isOrderProcessing && (
          <div className="loader-layout">
            <Loader />
          </div>
        )}
      <div className="checkout-page">
        {orderSuccessData && (
          <OrderSuccessOverlay
            orderId={orderSuccessData.orderId}
            totalAmount={orderSuccessData.totalAmount}
            onContinueShopping={handleContinueShopping}
            onViewOrderDetails={handleViewOrderDetails}
          />
        )}
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-left">
            {/* Address section */}
            <section className="checkout-section">
              <h2>Shipping Address</h2>
              <div className="address-list">
                {visibleAddresses.map(address => (
                  <div
                    key={address._id || address.id}
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
                      <p>{address.city}, {address.district}</p>
                      <p>{address.state} - {address.pincode}</p>
                      <p>Phone: {address.phone}</p>
                      <p>Country: {address.country}</p>
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

            {/* Payment method section */}
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

