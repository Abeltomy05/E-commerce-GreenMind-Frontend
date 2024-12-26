import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Box, CheckCircle2, MapPin, Package, Truck, Plus, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import {toast} from 'react-toastify'
import axioInstence from '../../../utils/axiosConfig';

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();


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
            // date: addHours(new Date(order.createdAt), 1).toLocaleString('en-US', {
            //   year: 'numeric',
            //   month: 'long',
            //   day: 'numeric',
            //   hour: '2-digit',
            //   minute: '2-digit'
            // })
          },
          {
            title: 'On The Road',
            description: 'Your order is on the way for delivery',
            // date: addHours(new Date(order.createdAt), 2).toLocaleString('en-US', {
            //   year: 'numeric',
            //   month: 'long',
            //   day: 'numeric',
            //   hour: '2-digit',
            //   minute: '2-digit'
            // })
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
            // date: addHours(new Date(order.createdAt), 1).toLocaleString('en-US', {
            //   year: 'numeric',
            //   month: 'long',
            //   day: 'numeric',
            //   hour: '2-digit',
            //   minute: '2-digit'
            // })
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

  // const addHours = (date, hours) => {
  //   const newDate = new Date(date);
  //   newDate.setHours(newDate.getHours() + hours);
  //   return newDate;
  // };

  const renderProgressTracker = (status) => {
    const stages = ['Order Placed', 'Packaging', 'On The Road', 'Delivered'];
    const stageIcons = [Box, Package, Truck, CheckCircle2];
    
    // For canceled orders, return a different view
    if (status === 'CANCELED') {
      return (
        <div className="relative flex justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
              <X className="h-5 w-5 text-white" />
            </div>
            <p className="mt-2 text-xs text-red-600">Order Canceled</p>
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
      const transformedOrder = {
          id: response.data.order._id, 
          orderDate: new Date(response.data.order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          totalAmount: `₹${response.data.order.totalPrice.toLocaleString()}`,
          status:response.data.order.status,
          timeline:  getOrderTimeline(response.data.order),

          products: response.data.order.products.map(product => ({
            id: product._id,
            name: product.name, 
            image: product.image || 'Product Image', 
            quantity: product.quantity,
            price: product.price
          })),
          address: {
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

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axioInstence.post(`/user/cancelorder/${orderId}`,{
          status: 'CANCELED',
          updatedAt: new Date().toISOString()
        });

        if (response.data.success) {
          setOrderDetails(prev => ({
            ...prev,
            status: 'CANCELED',
            timeline: [
              ...prev.timeline,
              {
                title: 'Order Canceled',
                description: 'Order has been canceled by customer',
                date: new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            ]
          }));

          await fetchOrderDetails();
        } else {
          throw new Error(response.data.message || 'Failed to cancel order');
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        toast.error('Failed to cancel order. Please try again.');
      }
    }
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
              onClick={handleCancelOrder}
              disabled={orderDetails.status === 'CANCELED' || orderDetails.status === 'DELIVERED'}
            >
              Cancel Order
            </button>
            <button className="flex items-center text-sm text-green-600 hover:text-green-700">
              Leave a Rating
              <Plus size={20}/>
            </button>
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

          {/* Order Activity */}
          {orderDetails.timeline && orderDetails.timeline.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-medium">Order Activity</h3>
              <div className="rounded-lg border p-4">
                {orderDetails.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      {index !== orderDetails.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-green-500"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
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
                    <div className="grid grid-cols-[150px,1fr,100px,100px,100px] gap-4 border-b p-4 text-sm font-medium text-gray-500">
                        <div>PRODUCTS</div>
                        <div></div>
                        <div className="text-right">QUANTITY</div>
                        <div className="text-right">PRICE</div>
                        <div className="text-right">SUB TOTAL</div>
                    </div>
                    {orderDetails.products.map((product) => (
                        <div 
                        key={product.id} 
                        className="grid grid-cols-[150px,1fr,100px,100px,100px] items-center gap-4 p-4 border-b last:border-b-0"
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
                        <div className="text-sm text-right">₹{product.price.toLocaleString()}</div>
                        <div className="text-sm font-medium text-right">
                            ₹{(product.price * product.quantity).toLocaleString()}
                        </div>
                        </div>
                    ))}
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
    <Footer/>
    </>
  );
};

export default OrderDetails;

