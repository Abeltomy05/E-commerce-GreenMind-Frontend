import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import api from '../../../utils/adminAxiosConfig';

const CouponCreation = ({ onSubmit, onCancel }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [maxUses, setMaxUses] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateNumbers = () => {
    if (parseInt(discount) < 0 || parseInt(discount) > 100) {
      setError('Discount must be between 0 and 100');
      return false;
    }
    if (parseInt(maxDiscount) > parseInt(minOrder)) {
      setError('Maximum discount cannot exceed minimum order amount');
      return false;
    }
    if (parseInt(maxDiscount) <= 0 || parseInt(minOrder) <= 0) {
      setError('Amounts must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
   if (!validateNumbers()) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedStartDate = new Date(startDate);
    selectedStartDate.setHours(0, 0, 0, 0);

    if (startDate && selectedStartDate < today) {
      setError('Start date cannot be in the past');
      return;
    }
    if (expiryDate && expiryDate <= startDate) {
        setError('Expiry date must be after start date');
        return;
      }
    setError('');
    setIsSubmitting(true);

    const formatDateForAPI = (date) => {
      if (!date) return null;
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate.toISOString();
      };

    const couponData = {
      code: couponCode,
      discount: Number(discount),
      maximumDiscountAmount: Number(maxDiscount),
      minimumPurchaseAmount: Number(minOrder),
      startDate:formatDateForAPI(startDate),
      expiryDate:formatDateForAPI(expiryDate),
      maxUses: Number(maxUses)
    };
      try {
      const response = await api.post('/admin/createcoupon', couponData);
      if (response.data.success) {
        onSubmit(response.data.coupon);
      } else {
        setError(response.data.message || 'Failed to create coupon');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon. Please try again.');
      console.error('Error creating coupon:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[90vh] bg-[#9bac9c] p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Add Coupon</h2>
      <div className="bg-white rounded-lg shadow-lg p-6 flex-grow overflow-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-grow overflow-auto grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                id="couponCode"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"
                required
              />
            </div>
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"
                required
              />
            </div>
            <div>
              <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount Price
              </label>
              <input
                type="number"
                id="maxDiscount"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"
                required
              />
            </div>
            <div>
              <label htmlFor="minOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Min Order Price
              </label>
              <input
                type="number"
                id="minOrder"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"
                required
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                required
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <DatePicker
                id="expiryDate"
                selected={expiryDate}
                onChange={(date) => setExpiryDate(date)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                required
              />
            </div>
            <div>
              <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses
              </label>
              <input
                type="number"
                id="maxUses"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#47645a]"

              />
            </div>
          </div>
          {error && (
            <div className="col-span-2 text-red-600 text-sm mt-2">
                {error}
            </div>
            )}
          <div className="flex gap-4 mt-6">
            <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#47645a] text-white py-2 px-4 rounded-md hover:bg-[#47645a]/90 transition-colors duration-300 disabled:opacity-50"
                >
                {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
                <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponCreation;

