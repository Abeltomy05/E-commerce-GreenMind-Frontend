import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Filter, Calendar, MoreVertical, Loader } from 'lucide-react';
import axios from 'axios'; 
import { toast } from 'react-toastify';
import BasicPagination from '../../../components/pagination/pagination';
import AdminBreadcrumbs from '../../../components/breadcrumbs/breadcrumbs';
import ReturnRequests from './returnrequest';
import api from '../../../utils/adminAxiosConfig';

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef({});
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(4);
  const [showReturnRequests, setShowReturnRequests] = useState(false);

  useEffect(() => {
    dropdownRef.current = {};
    fetchOrders();

    const handleGlobalClick = (event) => {
      const clickedInsideDropdown = Object.values(dropdownRef.current).some(
        (ref) => ref && ref.contains(event.target)
      )

      if (!clickedInsideDropdown) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  const toggleDropdown = (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/getorderdata');
      console.log('order data:::',response.data)
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
        console.log(response.data);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch orders');
      toast.error('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (selectedStatus.toLowerCase() === 'all status') {
      return orders;
    }
    return orders.filter(order => 
      order.paymentInfo.status.toLowerCase() === selectedStatus.toLowerCase()
    );
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const filteredOrders = getFilteredOrders();
  const pageCount = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'ON THE ROAD':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (e, orderId, newStatus) => {
    e.preventDefault(); 
    try {
      const response = await api.patch(`/admin/changeorderstatus/${orderId}`, {
        status: newStatus
      });
      if (response.data.success) {
        await fetchOrders();
        setOpenDropdownId(null);
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };
  const handleFilterChange = (status) => {
    setSelectedStatus(status);
    setPage(1); 
  };

  const handleCancelOrder = async (e, orderId) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await api.patch(`/admin/cancelorder/${orderId}`, {
          status: 'CANCELED'
        });
        if (response.data.success) {
          toast.success('Order cancelled successfully');
          await fetchOrders();
          setOpenDropdownId(null);
        } else {
          toast.error(response.data.message || 'Failed to cancel order');
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
        toast.error('Failed to cancel order');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center"><Loader /></div>;
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto bg-[#9bac9c] min-h-[95vh]">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-[#47645a] font-medium">Orders</h1>
          <button
            onClick={() => setShowReturnRequests(!showReturnRequests)}
            className="px-4 py-2 bg-[#47645a] text-white hover:bg-[#3a5147] rounded-lg text-sm font-medium"
          >
            {showReturnRequests ? 'View Orders' : 'View Return Requests'}
          </button>
        </div>
        
        {!showReturnRequests && (
          <div className="flex space-x-1 mb-4">
            {['All Status', 'Pending', 'Confirmed', 'On The Road', 'Delivered', 'Canceled'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleFilterChange(tab)}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        selectedStatus.toLowerCase() === tab.toLowerCase()
                          ? 'bg-[#47645a] text-white'
                          : 'text-[#1c211f] hover:bg-[#47645a] hover:bg-opacity-10'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
          </div>
        )}
      </div>

      {showReturnRequests ? (
        <ReturnRequests />
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[#949599]">
            <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b border-[#949599] text-sm font-medium text-[#1c211f]">
              <div>Product</div>
              <div>Date</div>
              <div>Customer</div>
              <div>Total</div>
              <div>Payment Method</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {error ? (
              <div className="p-4 text-center text-red-600">{error}</div>
            ): currentOrders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {selectedStatus.toLowerCase() === 'all status' 
                  ? 'No orders found.' 
                  : `No ${selectedStatus} orders found.`}
              </div>
            )  : (
              currentOrders.map((order) => (
                <div key={order._id} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b border-[#949599] last:border-b-0 items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <img
                      src={order.products[0]?.product?.images[0] || '/placeholder.svg?height=60&width=48'}
                      alt={order.products[0]?.product?.name || 'Product image'}
                      className="w-12 h-15 rounded object-cover"
                    />
                    <div>
                      <div className="font-medium text-[#2b3632]">{order.products[0]?.product?.name || 'Product Unavailable'}</div>
                      {order.products.length > 1 && (
                        <div className="text-[#1c211f] text-xs">
                          and {order.products.length - 1} more products
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[#1c211f]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[#2b3632]">
                    {order.user ? `${order.user.firstname} ${order.user.lastname}` : 'User Deleted'}
                  </div>
                  <div className="font-medium text-[#2b3632]">₹{order.totalPrice}</div>
                  <div className="text-[#1c211f]">{order.paymentInfo.method}</div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.paymentInfo.status
                      )}`}
                    >
                      {order.paymentInfo.status}
                    </span>
                  </div>
                  <div 
                    className="relative" 
                    ref={(el) => {
                      if (el) {
                        dropdownRef.current[order._id] = el;
                      }
                    }}
                  >             
                   <button 
                      className="p-2 hover:bg-[#47645a] hover:bg-opacity-10 rounded-lg"
                      onClick={(e) => toggleDropdown(e, order._id)}
                    >
                      <MoreVertical className="w-4 h-4 text-[#1c211f]" />
                    </button>
                    {openDropdownId === order._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#949599] z-10">
                        <div className="py-1">
                          <button
                             onClick={(e) => handleStatusChange(e, order._id, 'PENDING')}
                            className="block w-full px-4 py-2 text-left text-sm text-[#1c211f] hover:bg-[#47645a] hover:bg-opacity-10"
                          >
                            Mark as Pending
                          </button>
                          <button
                            onClick={(e) => handleStatusChange(e, order._id, 'CONFIRMED')}
                            className="block w-full px-4 py-2 text-left text-sm text-[#1c211f] hover:bg-[#47645a] hover:bg-opacity-10"
                          >
                            Mark as Confirmed
                          </button>
                          <button
                             onClick={(e) => handleStatusChange(e, order._id, 'ON THE ROAD')}
                            className="block w-full px-4 py-2 text-left text-sm text-[#1c211f] hover:bg-[#47645a] hover:bg-opacity-10"
                          >
                            Mark as On the road
                          </button>
                          <button
                           onClick={(e) => handleStatusChange(e, order._id, 'DELIVERED')}
                            className="block w-full px-4 py-2 text-left text-sm text-[#1c211f] hover:bg-[#47645a] hover:bg-opacity-10"
                          >
                            Mark as Delivered
                          </button>
                          <button
                            onClick={(e) => handleCancelOrder(e, order._id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-[#47645a] hover:bg-opacity-10"
                          >
                            Cancel Order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {pageCount > 1 && (
            <div className="mt-6 flex justify-center">
              <BasicPagination count={pageCount} onChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;

