import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';

const ReturnRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/admin/getreturnrequests');
      const data = await response.data;
      setReturnRequests(data);
    } catch (error) {
      setError('Failed to fetch return requests');
      console.error('Error fetching return requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (orderId,productId) => {
    try {
      const response = await axios.post(`http://localhost:3000/admin/approvereturn`,{
        orderId,
        productId
      });
      if (response.data.success) {
        toast.success('Return request approved successfully');
        fetchReturnRequests(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to approve return request');
      }
    } catch (error) {
      console.error('Error approving return request:', error);
      toast.error('Failed to approve return request');
    }
  };

  if (loading) {
    return <div className="p-6 text-center"><Loader/></div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Return Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 border-b text-left">Customer</th>
              <th className="px-6 py-3 border-b text-left">Product</th>
              <th className="px-6 py-3 border-b text-left">Return Reason</th>
              <th className="px-6 py-3 border-b text-left">Return Date</th>
              <th className="px-6 py-3 border-b text-left">Status</th>
              <th className="px-6 py-3 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {returnRequests.map((request) => (
              <tr key={`${request.orderId}-${request.productId}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  {`${request.user.firstname} ${request.user.lastname}`}
                </td>
                <td className="px-6 py-4 border-b">{request.product.name}</td>
                <td className="px-6 py-4 border-b">{request.returnReason}</td>
                <td className="px-6 py-4 border-b">
                  {new Date(request.returnDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 border-b">
                  {request.adminApproval ? 'Approved' : 'Pending'}
                </td>
                <td className="px-6 py-4 border-b">
                  {!request.adminApproval && (
                    <button 
                      onClick={() => handleApproveReturn(request.orderId, request.productId)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnRequests;

