import React from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import { toast } from 'react-toastify';


export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const handlePaymentFailure = async (error, user, orderId = null, amount = null, onFailureCallback = null,orderData) => {
  try {
    const errorDetails = {
      userId: user.id,
      paymentStatus: 'FAILED',
      totalPrice: amount,
      paymentMethod: 'razorpay',
      products: orderData.products.map(product => ({
        product: product.product,
        quantity: product.quantity,
        size: product.size || 'N/A', 
        cartItemId: null 
      })),
      addressId: orderData.addressId,
      errorDetails: {
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        orderId: orderId,
        originalAmount: amount
      },
      isRetry: true
    };

    const response = await axiosInstance.post('/user/razorpayplaceorder', {
      ...errorDetails,
      orderId: orderData.orderId || orderId, 
      isRetry: true 
    });

    if (onFailureCallback) {
      onFailureCallback({
        orderId: orderId,
        totalAmount: amount,
        errorMessage: error.message || 'Payment processing failed. Please try again.'
      });
    }
  } catch (err) {
    console.error('Error saving failed order:', err);
    if (err.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your internet connection.');

    } else {
      toast.error('Failed to save order information');
    }
    if (onFailureCallback) {
      onFailureCallback({
        orderId: orderId,
        totalAmount: amount,
        errorMessage: 'Payment processing failed due to network issues'
      });
    }
  }
};

export const initializeRazorpayPayment = async (
  orderData, 
  user, 
  onSuccessCallback, 
  onFailureCallback
) => {
  try {
    const res = await loadRazorpayScript();
    
    if (!res) {
      toast.error('Razorpay SDK failed to load');
      return;
    }

    const finalAmount = orderData.totalPrice;

    const orderPayload = {
      totalAmount: finalAmount,
      orderId: `order_${Date.now()}`
    };

    const response = await axiosInstance.post('/payment/razorpay', orderPayload);
    
    if (!response.data.success) {
      throw new Error('Failed to create order');
    }

    let isPaymentHandled = false;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: response.data.order.amount,
      currency: response.data.order.currency,
      name: "Green Mind",
      description: `Order Amount: ₹${(response.data.order.amount / 100).toFixed(2)}`,
      order_id: response.data.order.id,
      handler: async function (paymentResponse) {
        isPaymentHandled = true;
        try {
          const paymentVerification = await axiosInstance.post('/payment/razorpaypaymentverify', {
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
            paymentMethod: 'razorpay',
            paymentStatus: 'PENDING',
          };

          const orderResponse = await axiosInstance.post('/user/razorpayplaceorder', finalOrderData);
          
          if (!orderResponse.data.success) {
            throw new Error('Failed to save order');
          }

          onSuccessCallback(orderResponse.data.orderId);
        } catch (error) {
          handlePaymentFailure(error, user, response.data.order.id, finalAmount, onFailureCallback,orderData);
        }
      },
      retry:{
        enabled:false
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || ""
      },
      theme: {
        color: "#3399cc"
      },
      modal: {
        ondismiss: function() {
          if (!isPaymentHandled) {
            handlePaymentFailure(
              { message: "Payment was cancelled by user" }, 
              user, 
              response.data.order.id, 
              finalAmount, 
              onFailureCallback,
              orderData
            );
          }
        }
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', function (response) {
      isPaymentHandled = true;
      razorpay.close();

      handlePaymentFailure(
        { message: response.error.description || "Payment failed" }, 
        user, 
        response.error.metadata.order_id, 
        finalAmount, 
        onFailureCallback,
        orderData
      );
    });

    razorpay.open();

  } catch (error) {
    handlePaymentFailure(error, user);
  }
};