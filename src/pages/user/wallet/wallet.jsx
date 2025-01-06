import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, RotateCcw, XCircle } from 'lucide-react';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import axiosInstance from '../../../utils/axiosConfig';

const WalletComponent = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await axiosInstance.get('/user/walletdetails');
 
      if (response.data && response.data.success) {
        const { currentBalance, transactions } = response.data.data;
        setTransactions(transactions);
        setCurrentBalance(currentBalance || 0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async()=>{
    console.log('addmoney')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8f0ee]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3d5e52]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8f0ee]">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          Error loading wallet data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderLogin />
      <main className="flex-grow bg-[#e8f0ee] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Wallet Balance Section */}
            <div className="bg-[#3d5e52] p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center">
                  <div className="bg-[#2c453d] p-4 rounded-2xl mr-6">
                    <Wallet className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[#b8d0c8] text-base font-medium">Your wallet balance</p>
                    <h2 className="text-white text-4xl sm:text-5xl font-bold mt-1">
                      ₹{currentBalance.toFixed(2)}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={handleAddMoney}
                  className="bg-[#2c453d] hover:bg-[#1e2f29] text-white font-semibold py-3 px-6 rounded-xl flex items-center transition-all duration-300 hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add Money
                </button>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-[#3d5e52] mb-6">Transaction History</h3>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[#f3f7f6]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f3f7f6]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3d5e52]">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#3d5e52]">Type</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#3d5e52]">Amount</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#3d5e52]">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3f7f6]">
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-[#f9fafb] transition-colors">
                          <td className="px-6 py-4 text-sm text-[#3d5e52]">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${getTypeStyle(transaction.type)}`}>
                              {getTypeIcon(transaction.type)}
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right text-sm font-medium ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount >= 0 ? `+₹${transaction.amount.toFixed(2)}` : `-₹${Math.abs(transaction.amount).toFixed(2)}`}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-[#3d5e52]">
                            ₹{transaction.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const getTypeStyle = (type) => {
  switch (type) {
    case 'added':
      return 'bg-green-100 text-green-800';
    case 'bought':
      return 'bg-[#e8f0ee] text-[#3d5e52]';
    case 'returned':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'added':
      return <ArrowUpCircle className="w-4 h-4 mr-1.5" />;
    case 'bought':
      return <ArrowDownCircle className="w-4 h-4 mr-1.5" />;
    case 'returned':
      return <RotateCcw className="w-4 h-4 mr-1.5" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4 mr-1.5" />;
    default:
      return null;
  }
};

export default WalletComponent;