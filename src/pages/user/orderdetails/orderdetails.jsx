import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Box, CheckCircle2, MapPin, Package, Truck, Plus, X, Undo,FileDown, RefreshCw,XCircle,CheckCircle  } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import {toast} from 'react-toastify'
import axioInstence from '../../../utils/axiosConfig';
import RatingOverlay from './ratingOverlay';
import { useSelector } from 'react-redux';
import { initializeRazorpayPayment } from './razorpayUtility';
import CancelOrderOverlay from './cancelOrderOverlay';
import html2pdf from 'html2pdf.js';

const generateInvoice = (orderDetails) => {
  const invoiceContent = `
    <div style="font-family: Arial, sans-serif; padding: 40px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0;">INVOICE</h1>
        <p style="margin: 10px 0;">Order #${orderDetails.id}</p>
        <p style="margin: 10px 0;">Date: ${orderDetails.orderDate}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="margin-bottom: 10px;">Shipping Address:</h3>
        <p style="margin: 5px 0;">${orderDetails.address.name}</p>
        <p style="margin: 5px 0;">${orderDetails.address.address}</p>
        <p style="margin: 5px 0;">Phone: ${orderDetails.address.phone}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Unit Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Discount</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.products.map(product => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${product.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${product.price.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${((product.price - product.finalPrice) * product.quantity + product.couponDiscount).toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${((product.finalPrice * product.quantity) - product.couponDiscount).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right;">
        <p style="margin: 5px 0;">Subtotal: ₹${orderDetails.products.reduce((acc, product) => acc + (product.price * product.quantity), 0).toLocaleString()}</p>
        <p style="margin: 5px 0;">Product Discounts: -₹${orderDetails.products.reduce((acc, product) => acc + ((product.price - product.finalPrice) * product.quantity), 0).toLocaleString()}</p>
        ${orderDetails.couponDiscount > 0 ? `<p style="margin: 5px 0;">Coupon Discount: -₹${orderDetails.couponDiscount.toLocaleString()}</p>` : ''}
        <p style="margin: 5px 0;">Shipping Fee: ₹${orderDetails.shippingFee.toLocaleString()}</p>
        <h3 style="margin: 10px 0;">Total Amount: ${orderDetails.totalAmount}</h3>
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = invoiceContent;

  const opt = {
    margin: 1,
    filename: `invoice_${orderDetails.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

const DownloadInvoiceButton = ({ orderDetails }) => {
  return (
    <button 
      onClick={() => generateInvoice(orderDetails)}
      className="px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors flex items-center"
    >
      <FileDown className="mr-1 h-4 w-4" />
      Download Invoice
    </button>
  );
};



const PaymentFailureOverlay = ({
  orderId,
  totalAmount,
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
                {errorMessage || "Your payment didn't go through. Please try again."}
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
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={onRetryPayment}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-colors"
          >
            Retry Payment
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 focus:outline-none transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetails = () => {
  // const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  // const [paymentFailureData, setPaymentFailureData] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingOverlay, setShowRatingOverlay] = useState(false);
  const [paymentFailureData, setPaymentFailureData] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const { orderId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const getOrderTimeline = (order) => {
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Date not available'; 
        }
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return null;
      }
    };

    if (order.status === 'FAILED') {
      return [
        {
          title: 'Payment Failed',
          description: 'Your payment has failed',
          date: formatDate(order.updatedAt),
          isError: true  
        }
      ];
    }

    
    const timeline = [
      {
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        date: formatDate(order.createdAt)
      }
    ];
  
    // Add subsequent status changes based on order status
    switch (order.status) {
      case 'CANCELED':
        timeline.push({
          title: 'Order Canceled',
          description: 'Order has been canceled',
          date: formatDate(order.updatedAt)
        });
        break;

      case 'DELIVERED':
        timeline.push(
          {
            title: 'Order Confirmed',
            description: 'Your order has been confirmed and is being prepared',
          },
          {
            title: 'On The Road',
            description: 'Your order is on the way for delivery',
          },
          {
            title: 'Delivered',
            description: 'Your order has been delivered successfully',
            date: formatDate(order.updatedAt)
          }
        );
        break;
  
      case 'ON THE ROAD':
        timeline.push(
          {
            title: 'Order Confirmed',
            description: 'Your order has been confirmed and is being prepared',
          },
          {
            title: 'On The Road',
            description: 'Your order is on the way',
            date: formatDate(order.updatedAt)
          }
        );
        break;
  
      case 'CONFIRMED':
        timeline.push({
          title: 'Order Confirmed',
          description: 'Your order has been confirmed and is being prepared',
          date: formatDate(order.updatedAt)
        });
        break;
    }
  
    return timeline;
  };


  const renderProgressTracker = (status) => {
    const stages = ['Order Placed', 'Packaging', 'On The Road', 'Delivered'];
    const stageIcons = [Box, Package, Truck, CheckCircle2];
    
    // For canceled orders, return a different view
    if (status === 'CANCELED' || status === 'FAILED') {
      return (
        <div className="relative flex justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
              <X className="h-5 w-5 text-white" />
            </div>
            <p className="mt-2 text-xs text-red-600">
            {status === 'FAILED' ? 'Payment Failed' : 'Order Canceled'}
            </p>
          </div>
        </div>
      );
    }

    let activeStages = 0;
    switch (status) {
      case 'PENDING':
        activeStages = 1;
        break;
      case 'CONFIRMED':
        activeStages = 2;
        break;
      case 'ON THE ROAD':
        activeStages = 3;
        break;
      case 'DELIVERED':
        activeStages = 4;
        break;
      default:
        activeStages = 1;
    }

    return (
      <div className="relative mb-8">
        {/* Progress Line */}
        <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200">
          <div 
            className="h-full bg-green-500" 
            style={{ width: `${((activeStages - 1) / (stages.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Stage Icons */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => (
            <div key={stage} className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                index < activeStages ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {React.createElement(stageIcons[index], {
                  className: `h-5 w-5 ${
                    index < activeStages ? 'text-white' : 'text-gray-400'
                  }`
                })}
              </div>
              <p className={`mt-2 text-xs ${
                index < activeStages ? 'text-green-600' : 'text-gray-600'
              }`}>{stage}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };


  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axioInstence.get(`/user/orderdetails/${orderId}`);

      const totalProductValue = response.data.order.products.reduce((sum, product) => 
        sum + (product.finalPrice * product.quantity), 0
      );

      const shippingFee = 50;
      const transformedOrder = {
          id: response.data.order._id, 
          orderDate: new Date(response.data.order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          totalAmount: `₹${(response.data.order.totalPrice + shippingFee).toLocaleString()}`,
          couponDiscount: response.data.order.couponDiscount  || 0,
          shippingFee: shippingFee,
          status:response.data.order.status,
          timeline:  getOrderTimeline(response.data.order),

          products: response.data.order.products.map(product => ({
            id: product._id,
            name: product.name, 
            image: product.image || 'Product Image', 
            quantity: product.quantity,
            size: product.variantSize || 'N/A',
            price: product.price,
            finalPrice: product.finalPrice || product.price,
            couponDiscount: response.data.order.discountAmount ? 
            (product.finalPrice * product.quantity / totalProductValue) * response.data.order.discountAmount : 0
          })),
          address: {
            id: response.data.order.address?._id,
            name: response.data.order.address?.name || 'Not Provided', 
            address: response.data.order.address?.address || 'Address not available',
            phone: response.data.order.address?.phone,
            email: response.data.order.address?.email
          }
      };

      if (response.data.success) {
        setOrderDetails(transformedOrder); 
      } else {
        throw new Error(response.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (ratingData) => {
    try {
      const response = await axioInstence.post('/user/rate-order', ratingData);
      if (response.data.success) {
        toast.success('Thank you for your rating!');
      } else {
        throw new Error(response.data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  const handleSuccessfulOrder = (newOrderId) => {
    setSuccessOverlayData({
      orderId: newOrderId,
      totalAmount: orderDetails.products.reduce((total, product) => 
        total + (product.finalPrice * product.quantity), 0) + 50 
    });
    setShowSuccessOverlay(true);
  };

  const handleRetryPayment = () => {
    const orderData = {
      orderId: orderDetails.id, 
      userId: user.id,
      totalPrice: orderDetails.products.reduce((total, product) => 
        total + (product.finalPrice * product.quantity), 0),
      products: orderDetails.products.map(product => ({
        product: product.id,
        quantity: product.quantity,
        size: product.size || 'N/A', 
        cartItemId: null 
      })),
      addressId: orderDetails.address.id, 
      couponCode: orderDetails.couponDiscount ? 'RETRY' : null,
      paymentMethod: 'razorpay',
      paymentStatus: 'PENDING',
      paymentDetails: null,
    };

    initializeRazorpayPayment(
      orderData, 
      user, 
      async (newOrderId) => {
        // handleSuccessfulOrder(newOrderId);
        await fetchOrderDetails(); 
      },
      (failureData) => {
        setPaymentFailureData({
          orderId: orderDetails.id,
          totalAmount: orderData.totalPrice,
          errorMessage: failureData.errorMessage || 'Payment failed. Please try again.'
        });
      }
    );
  };

  useEffect(() => {
    fetchOrderDetails();
}, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No order details found.</p>
      </div>
    );
  }

  const subtotal = orderDetails.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const productOffers = orderDetails.products.reduce((sum, p) => sum + ((p.price - p.finalPrice) * p.quantity), 0);
  const couponDiscount = orderDetails.couponDiscount || 0;
  const shippingFee = orderDetails.shippingFee || 50;
  const total = subtotal - productOffers - couponDiscount + shippingFee;

  const handleCancelOrder = async (reason) => {
    try {
      setIsSubmittingCancel(true);
      const response = await axioInstence.post(`/user/cancelorder/${orderId}`, {
        cancellationReason: reason,
      });
  
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCancelOverlay(false);
        await fetchOrderDetails();
      } else {
        throw new Error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleReturnOrder = () => {
    navigate(`/user/return/${orderId}`);
  };

  return (
    <>
    <HeaderLogin/>
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between bg-white p-3">
          <button 
            onClick={() => navigate('/user/orders')} 
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ORDER DETAILS
          </button>
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowCancelOverlay(true)}
              disabled={orderDetails.status === 'CANCELED' || orderDetails.status === 'DELIVERED' || orderDetails.status === 'FAILED'}
            >
              Cancel Order
            </button>
            <button 
              className="px-3 py-1 text-sm border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleReturnOrder}
              disabled={orderDetails.status !== 'DELIVERED'}
            >
              <Undo className="mr-1 h-4 w-4" />
              Return Order
            </button>
            {orderDetails.status === 'DELIVERED' && (
                  <DownloadInvoiceButton orderDetails={orderDetails} />
                )}
            {orderDetails.status === 'DELIVERED' && (<button className="flex items-center text-sm text-green-600 hover:text-green-700"
            onClick={() => setShowRatingOverlay(true)}
            >
              Leave a Rating
              <Plus size={20}/>
            </button>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          {/* Order Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">#{orderDetails.id}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-gray-600">{orderDetails.orderDate}</p>
              </div>
            </div>
            <p className="text-xl font-semibold">{orderDetails.totalAmount}</p>
          </div>


          {renderProgressTracker(orderDetails.status)}

          {orderDetails.timeline && orderDetails.timeline.length > 0 && (
              <div className="mb-8">
                <div className='flex items-center justify-between'>
                   <h3 className="mb-4 text-lg font-medium">Order Activity</h3>
                    {orderDetails.status === 'FAILED' && (
                    <div className="mb-4">
                      <button 
                        onClick={handleRetryPayment}
                        className="px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors flex items-center"
                      >
                        <RefreshCw className="mr-1 h-4 w-4" />
                        Retry Payment
                      </button>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  {orderDetails.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full ${event.isError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        {index !== orderDetails.timeline.length - 1 && (
                          <div className={`h-full w-0.5 ${event.isError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`text-sm font-medium ${event.isError ? 'text-red-500' : ''}`}>{event.title}</p>
                        <p className={`text-sm ${event.isError ? 'text-red-400' : 'text-gray-600'}`}>{event.description}</p>
                        <p className="mt-1 text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

           

          {/* Products */}
          {orderDetails.products && orderDetails.products.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium">
              Products ({orderDetails.products.length})
            </h3>
            <div className="rounded-lg border">
              <div className="grid grid-cols-[150px,1fr,100px,100px,100px,100px] gap-4 border-b p-4 text-sm font-medium text-gray-500">
                <div>PRODUCTS</div>
                <div></div>
                <div className="text-right">QUANTITY</div>
                <div className="text-right">UNIT PRICE</div>
                <div className="text-right">DISCOUNT</div>
                <div className="text-right">SUB TOTAL</div>
              </div>
              {orderDetails.products.map((product) => {
                const offerDiscount = (product.price - product.finalPrice) * product.quantity;
                
                return (
                  <div 
                    key={product.id} 
                    className="grid grid-cols-[150px,1fr,100px,100px,100px,100px] items-center gap-4 p-4 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-20 rounded-md object-cover"
                      />
                      <div className="text-sm font-medium">{product.name}</div>
                    </div>
                    <div></div>
                    <div className="text-sm text-right">x{product.quantity}</div>
                    <div className="text-sm text-right">
                      <div>₹{product.price.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-right text-red-500">
                        -₹{offerDiscount.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-right">
                        ₹{(product.finalPrice * product.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
              
              {/* Order Summary */}
              <div className="border-t p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{orderDetails.products.reduce((acc, product) => acc + (product.price * product.quantity), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Product Offer Discounts</span>
                    <span>-₹{orderDetails.products.reduce((acc, product) => acc + ((product.price - product.finalPrice) * product.quantity), 0).toLocaleString()}</span>
                  </div>
                  {orderDetails.couponDiscount  > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Coupon Discount</span>
                      <span>-₹{orderDetails.couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                   <div className="flex justify-between text-sm">
                    <span>Shipping Fee</span>
                    <span>₹{orderDetails.shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Total Savings</span>
                    <span>-₹{(orderDetails.products.reduce((acc, product) => 
                      acc + ((product.price - product.finalPrice) * product.quantity), 0) + 
                      (orderDetails.couponDiscount  || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


          {/* Shipping Address */}
          {orderDetails.address && (
            <div>
              <h3 className="mb-4 text-lg font-medium">Shipping Address</h3>
              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{orderDetails.address.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {orderDetails.address.address}
                    </p>
                    {orderDetails.address.phone && (
                      <p className="mt-3 text-sm text-gray-600">
                        Phone Number: {orderDetails.address.phone}
                      </p>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {showRatingOverlay && orderDetails.status === 'DELIVERED' && (
        <RatingOverlay
          orderId={orderId}
          onClose={() => setShowRatingOverlay(false)}
          onSubmit={handleRating}
        />
      )}
    <Footer/>
    {paymentFailureData && (
      <PaymentFailureOverlay
        orderId={paymentFailureData.orderId}
        totalAmount={paymentFailureData.totalAmount}
        errorMessage={paymentFailureData.errorMessage}
        onRetryPayment={handleRetryPayment}
        onContinueShopping={() => navigate('/user/orders')}
      
      />
    )}
     {showCancelOverlay && (
        <CancelOrderOverlay
          onClose={() => setShowCancelOverlay(false)}
          onConfirm={handleCancelOrder}
          isSubmitting={isSubmittingCancel}
        />
      )}
    </>
  );
};

export default OrderDetails;

