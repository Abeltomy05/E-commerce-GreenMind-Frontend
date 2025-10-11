import React, { useEffect, useState } from 'react';
import { X, Package, Calendar, CreditCard, MapPin, User } from 'lucide-react';
import { getStatusColor } from '../../../utils/constants/status-color';
import api from '../../../utils/adminAxiosConfig';

const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Fetching order details for:', orderId, 'isOpen:', isOpen);
    const fetchOrderDetails = async () => {
      if (!isOpen || !orderId) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/admin/getorderdetails/${orderId}`);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

     fetchOrderDetails();
  }, [isOpen, orderId]);

   if (!isOpen) return null;

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [
    address.fullName,
    address.addressLine,
    address.city,
    address.district,
    address.state,
    address.country,
    address.pincode ? `PIN: ${address.pincode}` : null
  ].filter(Boolean);

    return parts.join(', ');  
  };

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#47645a] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Order Details</h2>
            {order && (
              <p className="text-sm text-white text-opacity-80 mt-1">
                Order ID: {order.orderId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="p-6 text-center text-gray-600">Loading order details...</div>
        )}
        {error && (
          <div className="p-6 text-center text-red-500">{error}</div>
        )}

        {!loading && !error && order && (
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {/* Status & Date */}
            <div className="mb-6 flex items-center justify-between">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(order.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-[#47645a] mr-2" />
                <h3 className="text-lg font-semibold text-[#47645a]">Products</h3>
              </div>
              <div className="space-y-4">
                {order.products?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.productName || 'Product'}
                      className="w-20 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Size: {item.size || 'N/A'}</p>
                      <p className="text-lg font-semibold text-[#47645a] mt-2">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer + Address */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-[#47645a] mr-2" />
                  <h3 className="text-lg font-semibold text-[#47645a]">Customer Information</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-900 font-medium">
                    {order.user
                      ? `${order.user.firstname} ${order.user.lastname}`
                      : 'User Deleted'}
                  </p>
                  <p className="text-sm text-gray-600">{order.user?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{order.user?.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-[#47645a] mr-2" />
                  <h3 className="text-lg font-semibold text-[#47645a]">Shipping Address</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {formatAddress(order.address)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-[#47645a] mr-2" />
                <h3 className="text-lg font-semibold text-[#47645a]">Payment Summary</h3>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>₹{(order.financials?.totalPrice + order.financials.discountAmount) || 0}</span>
                </div>
                {order.financials?.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>- ₹{order.financials.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping Fee:</span>
                  <span>₹{order.financials?.shippingFee || 0}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold text-[#47645a]">
                  <span>Total Amount Paid:</span>
                  <span>₹{order.financials?.totalPrice + order.financials?.shippingFee}</span>
                </div>

                {/* Payment Info */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Payment Method:</span>
                    <span className="font-semibold text-gray-900">
                      {order.payment?.method?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-700">Payment Status:</span>
                    <span
                      className={`font-semibold ${
                        order.payment?.status === 'CONFIRMED'
                          ? 'text-green-600'
                          : order.payment?.status === 'FAILED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.payment?.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsModal;