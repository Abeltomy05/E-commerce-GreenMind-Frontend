import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderLogin from '../../../components/header-login/header-login';
import axiosInstance from '../../../utils/axiosConfig';
import Footer from '../../../components/footer/footer';


const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <h2 className="text-xl font-bold text-[#3d5e52] mb-4">Confirm Action</h2>
        <p className="text-gray-700 text-sm mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-[#3d5e52] text-white rounded-md hover:bg-[#1a2c25]"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

const ReturnProductPage = () => {
  const [showPolicy, setShowPolicy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState({});
  const [otherReasons, setOtherReasons] = useState({});
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orderId } = useParams();

  const getReturnStatus = (product) => {
    if (!product.returnStatus.isReturned) return null;
    if (product.returnStatus.isReturned && !product.returnStatus.adminApproval) {
      return { status: 'pending', message: 'Return request is pending admin approval' };
    }
    return { 
      status: 'confirmed', 
      message: 'Return is confirmed and the product will be collected within 2 days' 
    };
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user/getorderforreturn/${orderId}`);
      if (!response.data) throw new Error('No data received from server');
      setOrderData(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order details';
      toast.error(message);
      navigate(`/user/orderdetails/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (productId) => {
    const reason = selectedReasons[productId] 
      ? reasons.find(r => r.id === selectedReasons[productId])?.text 
      : otherReasons[productId];

    if (!reason) {
      toast.error('Please provide a reason for return');
      return;
    }

    setSelectedProductId(productId);
    setShowConfirm(true);
  };

  const handleConfirmReturn = async () => {
    try {
      await axiosInstance.post(`/user/handlereturn/${orderId}/${selectedProductId}`, {
        reason: selectedReasons[selectedProductId] 
          ? reasons.find(r => r.id === selectedReasons[selectedProductId])?.text 
          : otherReasons[selectedProductId]
      });
      toast.success('Return request submitted successfully');
      setShowConfirm(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };


  const reasons = [
    { id: 1, text: 'Damaged product' },
    { id: 2, text: 'Wrong size' },
    { id: 3, text: 'Wrong product' },
    { id: 4, text: "Didn't like the product" },
  ];

  const policies = [
    'Items must be returned within 30 days of delivery in their original condition with tags and packaging.',
    'Refunds will be issued to the wallet within 7 business days of receiving the returned item.',
    'Sale items, gift cards, personalized products, and perishable goods are non-returnable.',
    'If you receive a damaged or defective item, contact us within 48 hours of delivery.',
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!orderData) {
    return <div className="flex justify-center items-center min-h-screen">Order not found</div>;
  }

  return (
    <>
      <HeaderLogin />
      <div className="flex flex-col min-h-100vh">
        <div className="flex-grow bg-[#778e85]/10 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => navigate(`/user/orderdetails/${orderId}`)} 
                  className="text-[#3d5e52] hover:text-[#1a2c25] flex items-center text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Order Details
                </button>
                <h1 className="text-3xl font-bold text-[#3d5e52] text-center flex-grow">Request to Return</h1>
              </div>

              {orderData.products.map((orderProduct) => {
                const product = orderProduct.product;
                const variant = product.variants[0];
                const returnStatus = getReturnStatus(orderProduct);
                const originalPrice = variant.price;
                const finalPrice = orderProduct.finalPrice;
                const discount = originalPrice - finalPrice;
                const discountPercentage = Math.round((discount / originalPrice) * 100);
                
                return (
                  <div key={product._id} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
                    <div className="flex items-center mb-6">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-24 h-24 object-cover rounded-md mr-6" 
                      />
                      <div className="flex-grow">
                        <h2 className="text-xl font-semibold text-[#1a2c25] mb-1">{product.name}</h2>
                        <p className="text-[#375d51] text-sm">Category: {product.category.name}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-[#375d51] text-sm font-medium">
                            Price: ₹{finalPrice}
                          </p>
                          {discount > 0 && (
                            <>
                              <p className="text-gray-500 text-sm line-through">₹{originalPrice}</p>
                              <p className="text-green-600 text-sm">({discountPercentage}% off)</p>
                            </>
                          )}
                        </div>
                        <p className="text-[#375d51] text-sm">Size: {variant.size}</p>
                      </div>
                      {returnStatus && (
                        <div className="ml-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            returnStatus.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {returnStatus.status === 'pending' ? 'Return Pending' : 'Return Confirmed'}
                          </span>
                        </div>
                      )}
                    </div>

                    {returnStatus ? (
                      <div className="mb-6 p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-700">{returnStatus.message}</p>
                        {returnStatus.status === 'pending' && (
                          <p className="text-sm text-gray-500 mt-2">
                            Return reason: {orderProduct.returnStatus.returnReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-[#3d5e52] mb-3">Reason for Return</h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {reasons.map((reason) => (
                            <button
                              key={reason.id}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                selectedReasons[product._id] === reason.id
                                  ? 'bg-[#3d5e52] text-white'
                                  : 'bg-[#778e85]/20 text-[#3d5e52] hover:bg-[#778e85]/30'
                              }`}
                              onClick={() => setSelectedReasons(prev => ({
                                ...prev,
                                [product._id]: reason.id
                              }))}
                            >
                              {reason.text}
                            </button>
                          ))}
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-medium text-[#1a2c25] mb-2">
                            Other Reasons
                          </label>
                          <textarea
                            rows="3"
                            className="w-full px-3 py-2 text-[#333] text-sm border border-[#778e85] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3d5e52]"
                            placeholder="Please provide reason"
                            value={otherReasons[product._id] || ''}
                            onChange={(e) => setOtherReasons(prev => ({
                              ...prev,
                              [product._id]: e.target.value
                            }))}
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            className="px-6 py-2 bg-[#3d5e52] text-white text-sm font-medium rounded-md hover:bg-[#1a2c25] transition-colors duration-200"
                            onClick={() => handleReturnSubmit(product._id)}
                          >
                            Request Return
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end mt-4">
                <button
                  className="text-[#3d5e52] text-sm font-medium hover:text-[#1a2c25] transition-colors duration-200"
                  onClick={() => setShowPolicy(true)}
                >
                  View Return Policy
                </button>
              </div>
            </div>
          </div>
        </div>

        {showPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
              <h2 className="text-2xl font-bold text-[#3d5e52] mb-4">Return Policy</h2>
              <ul className="list-disc pl-5 mb-4">
                {policies.map((policy, index) => (
                  <li key={index} className="text-[#333] text-sm mb-2">{policy}</li>
                ))}
              </ul>
              <button
                className="absolute top-3 right-3 text-[#778e85] hover:text-[#3d5e52]"
                onClick={() => setShowPolicy(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmReturn}
        message="Are you sure you want to submit this return request?"
      />
      <Footer />
    </>
  );
};

export default ReturnProductPage;

