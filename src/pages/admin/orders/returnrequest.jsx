import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';
import BasicPagination from '../../../components/pagination/pagination';
import api from '../../../utils/adminAxiosConfig';

const ReturnRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [requestsPerPage] = useState(4);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/getreturnrequests');
      const data = await response.data;

      const validatedRequests = data.map(request => ({
        ...request,
        user: {
          name: request.user 
            ? `${request.user.firstname || ''} ${request.user.lastname || ''}`.trim() || 'Unknown User'
            : 'Unknown User',
          ...request.user
        },
        product: {
          name: request.product?.name || 'Unknown Product',
          ...request.product
        },
        returnReason: request.returnReason || 'No reason provided',
        returnDate: request.returnDate || new Date(),
        adminApproval: !!request.adminApproval
      }));


      setReturnRequests(validatedRequests);
    } catch (error) {
      setError('Failed to fetch return requests');
      console.error('Error fetching return requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (orderId,productId) => {
    try {
      const response = await api.post(`/admin/approvereturn`,{
        orderId,
        productId
      });

       if (response.data.success) {
            if (response.data.refunded) {
                toast.success('Return request approved and amount refunded to wallet');
            } else {
                toast.success('Return request approved successfully');
            }
            fetchReturnRequests(); 
        } else {
            toast.error(response.data.message || 'Failed to approve return request');
        }

    } catch (error) {
      console.error('Error approving return request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve return request';
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const pageCount = Math.ceil(returnRequests.length / requestsPerPage);
  const startIndex = (page - 1) * requestsPerPage;
  const currentRequests  = returnRequests.slice(startIndex, startIndex + requestsPerPage);

  if (loading) {
    return <div className="p-6 text-center"><Loader/></div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 font-medium">{error}</div>
        <button 
          onClick={fetchReturnRequests}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Return Requests</h2>
      {returnRequests.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded">
          No return requests found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-sm rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Reason
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.map((request) => (
                  <tr key={`${request.orderId}-${request.productId}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.returnReason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(request.returnDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.adminApproval 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.adminApproval ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!request.adminApproval && (
                        <button 
                          onClick={() => handleApproveReturn(request.orderId, request.productId)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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

export default ReturnRequests;

