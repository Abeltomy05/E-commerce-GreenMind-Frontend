import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BasicPagination from '../../../components/pagination/pagination';
import axioInstence from '../../../utils/axiosConfig';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(4);

  const user = useSelector(state => state.user.user);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        console.log('No user ID available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axioInstence.get(`/user/getorderdata/${user.id}`);
        const shippingCharge = 50;

       
        if (response.data && response.data.success && Array.isArray(response.data.orders)) {

          const transformedOrders = response.data.orders.map(order => ({
            id: order._id,
            productName: order.products && order.products.length > 0
            ? (order.products.length === 1
              ? order.products[0].productName   
              : `${order.products[0].productName} + ${order.products.length - 1} more`)
              : 'Unknown Product',
            status: order.status,
            date: new Date(order.createdAt).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            total: `₹${(order.totalPrice+shippingCharge).toLocaleString()}`,
            itemCount: order.products ? order.products.reduce((total, item) => total + item.quantity, 0) : 0,
            expectedDeliveryDate: order.expectedDeliveryDate 
              ? new Date(order.expectedDeliveryDate).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'N/A'
          }));

          setOrders(transformedOrders);
          console.log(transformedOrders)
        } else {
          console.log('No orders found or invalid data structure');
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'An error occurred while fetching orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const pageCount = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  if (isLoading) {
    return (
      <>
        <HeaderLogin/>
        <div className="w-full min-h-[80vh] bg-gradient-to-br from-purple-50 to-purple-100 p-6 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading orders...</div>
        </div>
        <Footer/>
      </>
    );
  }

 

  if (error) {
    return (
      <>
        <HeaderLogin/>
        <div className="w-full min-h-[80vh] bg-gradient-to-br from-purple-50 to-purple-100 p-6 flex items-center justify-center">
          <div className="text-xl text-red-600">Error: {error}</div>
        </div>
        <Footer/>
      </>
    );
  }
  

  return (
    <>
      <HeaderLogin/>
      <div className="w-full min-h-[80vh] bg-gradient-to-br from-purple-50 to-purple-100 p-6">
        <div className="bg-white rounded-xl shadow-sm max-w-5xl mx-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              ORDER HISTORY
            </h2>
            {currentOrders.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                No orders found.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <div className="w-1/3">Product</div>
                    <div className="w-2/3 flex">
                      <div className="w-1/4 px-2">Date</div>
                      <div className="w-1/4 px-2">Total</div>
                      <div className="w-1/4 px-2">Status</div>
                      <div className="w-1/4 px-2">Action</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 w-1/3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <span className="text-lg font-medium text-gray-600">
                            {order.productName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {order.productName}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-2/3">
                        <div className="text-sm text-gray-600 w-1/4 ">
                          {order.date}
                        </div>
                        <div className="text-sm font-medium text-gray-900 w-1/4 px-2">
                          {order.total}
                          <span className="text-gray-500 ml-1 whitespace-nowrap">
                            ({order.itemCount} Items)
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-1/4 justify-center ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <div className="w-1/4 px-2 flex justify-center">
                          <button className="flex items-center text-sm text-green-500 hover:text-green-700 transition-colors" onClick={()=>navigate(`/user/orderdetails/${order.id}`)}>
                            View Details
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
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

export default OrderHistory;

