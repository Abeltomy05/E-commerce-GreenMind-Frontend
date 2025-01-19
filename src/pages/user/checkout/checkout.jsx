import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Tag, ChevronDown, ChevronUp, CheckCircle,ShoppingBag,XCircle, RefreshCw  } from 'lucide-react';
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
import AddAddressOverlay from './addadressoverlay';

const OrderSuccessOverlay = ({ orderId, totalAmount, onContinueShopping, onViewOrderDetails, onClose }) => {
  return (
    <div className="order-success-overlay">
      <div className="order-success-content">
        <CheckCircle size={100} color="green" className='checkcircle'/>
        <h1>Order Placed Successfully!</h1>
        <div className="order-details">
          <p>Order Number: <strong>{orderId}</strong></p>
          <p>Total Amount: <strong>₹{Number((totalAmount)+50).toFixed(2)}</strong></p>
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

const PaymentFailureOverlay = ({
  orderId,
  totalAmount,
  paymentMethod,
  onRetryPayment,
  onContinueShopping,
  errorMessage
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">

        <div className="text-center mb-6">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900">Payment Failed!</h2>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Payment Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {errorMessage || "Your payment didn't go through as it was declined by the bank. Try another payment method or contact your bank."}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">₹{Number((totalAmount)+50).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={onRetryPayment}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-colors"
          >
            Try Payment Again
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 focus:outline-none transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    </div>
  );
};


const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedItems, total } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user.user);

  const subtotal = selectedItems.reduce((sum, item) => 
    sum + (item.displayPrice.current * item.quantity), 0
  );

  const [paymentFailureData, setPaymentFailureData] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
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
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [discountedSubtotal, setDiscountedSubtotal] = useState(subtotal);
  const [showCoupons, setShowCoupons] = useState(false);

  let razorpayInstance = null;

  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      navigate('/user/cart');
    }
  }, [selectedItems, navigate]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axioInstence.get(`/user/displaycoupons?orderAmount=${subtotal}`);
        if (response.data.success) {
          setAvailableCoupons(response.data.coupons);
        }
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
        toast.error('Failed to load coupons');
      }
    };

    if (subtotal > 0) {
      fetchCoupons();
    }
  }, [subtotal]);

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

  const handleCouponSelect = (code) => { 
    setCouponCode(code);
  };

  const toggleCoupons = () => {
    setShowCoupons(!showCoupons);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const response = await axioInstence.get('/user/applycoupen', {
        params: { 
          code: couponCode,
          orderAmount: subtotal
        }
      });
  
      if (response.data.success) {
        setAppliedDiscount(response.data.discountAmount);
        setDiscountedSubtotal(response.data.finalAmount); 
        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
      setCouponCode('');
      setAppliedDiscount(0);
    }
  };

  const handlePaymentFailure = (error, orderId = null, amount = null) => {
    if (razorpayInstance) {
      razorpayInstance.close();
    }

    setPaymentFailureData({
      orderId: orderId || 'N/A',
      totalAmount: amount || (subtotal - appliedDiscount),
      paymentMethod: paymentMethod,
      errorMessage: error.message || 'Payment processing failed. Please try again.'
    });
    setIsOrderProcessing(false);
    setOrderSuccessData(null);
  };

  const handleRetryPayment = async () => {
    setPaymentFailureData(null);
    if (paymentMethod === 'razorpay') {
      // Re-initialize Razorpay payment with the same order data
      const orderData = {
        userId: user.id,
        products: selectedItems.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          size: item.size,
          cartItemId: item.id
        })),
        addressId: selectedAddress._id,
        paymentMethod: paymentMethod,
        couponCode: couponCode || null,
        totalPrice: subtotal - appliedDiscount
      };
      await initializeRazorpayPayment(orderData);
    } else if (paymentMethod === 'cod') {
      // Retry COD order placement
      handleSubmit(new Event('submit'));
    }
  };



  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleCardDetailsChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
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

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
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

      setOrderSuccessData({
        orderId: orderResponse.data.orderId,
        totalAmount: subtotal - appliedDiscount
      });
      
      // dispatch(clearSelectedItems());
      // toast.success('Order placed successfully!');
      
    } catch (error) {
      handlePaymentFailure(error, orderData?.orderId, orderAmount);
    } finally {
        setIsOrderProcessing(false);
    }
  }, [dispatch,subtotal, appliedDiscount]);

  const initializeRazorpayPayment = async (orderData) => {
    try {
      setIsOrderProcessing(true);
      const res = await loadRazorpayScript();
      
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        setIsOrderProcessing(false); 
        return;
      }
      const finalAmount = orderData.totalPrice;

      const orderPayload = {
           totalAmount: finalAmount,
            orderId: `order_${Date.now()}`
      };

      const response = await axioInstence.post('/payment/razorpay', orderPayload);
      
      if (!response.data.success) {
        throw new Error('Failed to create order');
      }

      // let razorpayInstance = null;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: "Green Mind",
        description: `Order Amount: ₹${(response.data.order.amount / 100).toFixed(2)}`,
        order_id: response.data.order.id,
        handler: async function (paymentResponse) {
          await handleRazorpaySuccess(
            paymentResponse, 
            orderData, 
            finalAmount 
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
        modal: {
          ondismiss: function() {
            setPaymentFailureData({
              orderId: response.data.order.id,
              totalAmount: finalAmount,
              paymentMethod: 'razorpay',
              errorMessage: "Payment was cancelled. Please try again."
            });
            setIsOrderProcessing(false);
            if (razorpayInstance) {
              razorpayInstance.close();
            }
          },
          escape: true,
          confirm_close: false
        }
      };
      //   "payment.failed": function (response){
      //     if (razorpayInstance) {
      //       razorpayInstance.close();
      //     }
      //     setPaymentFailureData({
      //       orderId: response.error.metadata.order_id,
      //       totalAmount: finalAmount,
      //       paymentMethod: 'razorpay',
      //       errorMessage: response.error.description || "Your payment didn't go through as it was declined by the bank. Please try another payment method."
      //     });
      //     setIsOrderProcessing(false);
      //   },
      //   "payment.cancel": function(){
      //     setPaymentFailureData({
      //       orderId: response.data.order.id,
      //       totalAmount: finalAmount,
      //       paymentMethod: 'razorpay',
      //       errorMessage: "Payment was cancelled. Please try again."
      //     });
      //     setIsOrderProcessing(false);
      //   }
      // };

      razorpayInstance = new window.Razorpay(options);
      //for failure payment
      razorpayInstance.on('payment.failed', function (response) {
        if (razorpayInstance) {
          razorpayInstance.close();
        }

        setPaymentFailureData({
          orderId: response.error.metadata.order_id,
          totalAmount: finalAmount,
          paymentMethod: 'razorpay',
          errorMessage: response.error.description || "Your payment didn't go through as it was declined by the bank. Please try another payment method."
        });
        setIsOrderProcessing(false);
      });

      razorpayInstance.open();

    } catch (error) {
      console.error('Razorpay payment initialization failed:', error);
      handlePaymentFailure(error, orderData?.orderId, orderData?.totalPrice); 
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
      paymentMethod: paymentMethod,
      couponCode: couponCode || null,
    };
    

    try {
      const amountResponse = await axioInstence.post('/user/calculateOrderAmount', {
        products: orderData.products,
        couponCode: orderData.couponCode
      });
      const finalAmount = amountResponse.data.data.totalAmount;

      if (paymentMethod === 'cod') {
        setIsOrderProcessing(true);
        const response = await axioInstence.post('/user/placeorder', {
          ...orderData,
          totalPrice: finalAmount
        });
        setTimeout(()=>{
          setIsOrderProcessing(false);
          setOrderSuccessData({
            orderId: response.data.orderId,
            totalAmount: subtotal - appliedDiscount
          });
        },3000)
      
      } 
      else if (paymentMethod === 'razorpay') {
        orderData.totalPrice = finalAmount;
        await initializeRazorpayPayment(orderData);
      }
      else if (paymentMethod === 'credit-card') {
       console.log('Credit card payment method selected');
      }
    } catch (error) {
      handlePaymentFailure(error);
    }

  };

  const handleAddAddress = async (addressData) => {
    try {
      const response = await axioInstence.post(`/user/addaddresscheckoutpage/${user.id}`, addressData);
      if (response.data.success) {
        const updatedAddresses = await axioInstence.get(`/user/addressdata/${user.id}`);
        setAddresses(updatedAddresses.data);
        toast.success('Address added successfully');
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      toast.error('Failed to add address');
    }
  };

  if (isLoading) {
    return <div>Loading addresses...</div>;
  }

  if (error) {
    return <div>Error loading addresses: {error}</div>;
  }

  const visibleAddresses = showAllAddresses ? addresses : addresses.slice(0, 1);

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
        {paymentFailureData && (
          <PaymentFailureOverlay
            orderId={paymentFailureData.orderId}
            totalAmount={paymentFailureData.totalAmount}
            paymentMethod={paymentFailureData.paymentMethod}
            errorMessage={paymentFailureData.errorMessage}
            onRetryPayment={handleRetryPayment}
            onContinueShopping={() => navigate('/user/cart')}
          />
        )}
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-left">
            {/* Address section */}
            <section className="checkout-section">
            <div className="address-section-header">
                  <h2>Shipping Address</h2>
                  <button 
                    className="add-address-btn"
                    onClick={() => setShowAddressForm(true)}
                  >
                    + Add New Address
                  </button>
                </div>
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
                {/* <div
                  className={`payment-option ${paymentMethod === 'credit-card' ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect('credit-card')}
                >
                  <CreditCard />
                  <span>Credit Card</span>
                </div> */}
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
              <div className="available-coupons">
              <div 
                  className="coupon-header flex items-center justify-between  p-2 cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={toggleCoupons}
                >
                  <h3>
                    <ShoppingBag className="inline-icon" />
                    Available Coupons
                  </h3>
                  {showCoupons ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {showCoupons && (
                  <div className="coupon-list">
                    {availableCoupons.length > 0 ? (
                      availableCoupons.map((coupon, index) => (
                      <div key={index} className="coupon-item">
                        <span className="coupon-code">{coupon.code}</span>
                        <span className="coupon-discount">{coupon.discount}</span>
                        <span className="coupon-min">Min order: ${coupon.minimumPurchaseAmount}</span>
                        <button onClick={() => handleCouponSelect(coupon.code)}  disabled={couponCode === coupon.code}> 
                          {couponCode === coupon.code ? 'Selected' : 'Use Coupon'}
                          </button>
                      </div>
                    ))
                  ):(
                    <div className="no-coupons-message">
                    <p>No coupons available for this order</p>
                  </div>
                  )}
                  </div>
                  )}
                  {appliedDiscount > 0 && (
                      <div className="discount-applied">
                        <span>Discount Applied:</span>
                        <span>-${appliedDiscount.toFixed(2)}</span>
                      </div>
                    )}
                </div>
              <div className="order-summary">
                <div className="cart-items">
                  {selectedItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-quantity">x{item.quantity}</span>
                      <span className="cart-item-price">
                        ${(item.displayPrice.current * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="coupon-section">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    readOnly={couponCode !== ''}
                  />
                  <button className="apply-coupon" onClick={handleApplyCoupon}  disabled={!couponCode} >
                    <Tag />
                    {appliedDiscount > 0 ? 'Applied' : 'Apply'}
                  </button>
                </div>
                <div className="order-totals">
                  <div className="subtotal">
                    <span>Original Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                      <div className="discount">
                        <span>Discount Applied</span>
                        <span>-${appliedDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  <div className="shipping">
                    <span>Shipping</span>
                    <span>₹50.00</span>
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <span>${((subtotal-appliedDiscount)+50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button className="proceed-payment" onClick={handleSubmit}>Place Order</button>
            </section>
          </div>
        </div>
        {showAddressForm && (
            <AddAddressOverlay
              onClose={() => setShowAddressForm(false)}
              onAddAddress={handleAddAddress}
            />
          )}
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;

