import axios from 'axios';
import React, { useState,useEffect } from 'react';


export default function CreateOfferForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: '',
    discountValue: '',
    startDate: '',
    endDate: '',
    applicableTo: '',
    targetName: '',
    maxDiscountAmount: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targets, setTargets] = useState([]);

  useEffect(() => {
    if (formData.applicableTo) {
      fetchTargets();
    }
  }, [formData.applicableTo]);

  const fetchTargets = async () => {
    try {
      const endpoint = formData.applicableTo === 'product' ? 'http://localhost:3000/admin/products' : 'http://localhost:3000/admin/categories';
      const response = await axios.get(endpoint);
      setTargets(response.data);
    } catch (err) {
      setError('Failed to fetch ' + formData.applicableTo + 's');
    }
  };

  const formatDateToMidnight = (date) => {
    const d = new Date(date);

  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
  };

   const handleChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'startDate' || id === 'endDate') {

      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value,
        ...(id === 'applicableTo' && { targetName: '' })
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name) return 'Name is required';
    if (!formData.discountType) return 'Discount type is required';
    if (!formData.discountValue) return 'Discount value is required';
    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      return 'Percentage discount cannot exceed 100%';
    }
    if (!formData.startDate) return 'Start date is required';
    if (!formData.endDate) return 'End date is required';

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const startDate = new Date(formData.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(formData.endDate);
    endDate.setUTCHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return 'Start date cannot be in the past';
    }
    if (endDate <= startDate) {
      return 'End date must be after start date';
    }

    if (!formData.applicableTo) return 'Applicable to is required';
     if (!formData.targetName) return `${formData.applicableTo} is required`;
    return null;


  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
        const submitData = {
            ...formData,
            startDate: formatDateToMidnight(formData.startDate),
            endDate: formatDateToMidnight(formData.endDate)
          };
      console.log('Submitting form data:', formData);
      const response = await axios.post('http://localhost:3000/admin/createoffer', submitData);
      console.log('Response:', response.data); 
      onClose();
    } catch (err) {
        console.log('Error response:', err.response?.data);
        setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg mb-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">Create Offer</h2>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer">
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block mb-1">Name</label>
            <input 
              id="name" 
              type="text" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Offer name" 
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1">Description</label>
            <textarea 
              id="description" 
              value={formData.description}
              onChange={handleChange}
              placeholder="Offer description" 
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="discountType" className="block mb-1">Discount Type</label>
            <select 
              id="discountType" 
              value={formData.discountType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select discount type</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label htmlFor="discountValue" className="block mb-1">Discount Value</label>
            <input 
              id="discountValue" 
              type="number" 
              value={formData.discountValue}
              onChange={handleChange}
              placeholder="Discount value" 
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block mb-1">Start Date</label>
            <input 
              id="startDate" 
              type="date" 
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block mb-1">End Date</label>
            <input 
              id="endDate" 
              type="date" 
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
          <label htmlFor="applicableTo" className="block mb-1">Applicable To</label>
          <select 
            id="applicableTo" 
            value={formData.applicableTo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select applicable to</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
          </select>
          </div>

          {formData.applicableTo && (
          <div>
            <label htmlFor="targetName" className="block mb-1">
              Select {formData.applicableTo === 'product' ? 'Product' : 'Category'}
            </label>
            <select
              id="targetName"
              value={formData.targetName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select {formData.applicableTo}</option>
              {targets.map(target => (
                <option key={target._id} value={target.name}>
                  {target.name}
                </option>
              ))}
            </select>
          </div>
        )}

          <div>
            <label htmlFor="maxDiscountAmount" className="block mb-1">Max Discount</label>
            <input 
              id="maxDiscountAmount" 
              type="number" 
              value={formData.maxDiscountAmount}
              onChange={handleChange}
              placeholder="Max discount amount" 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-white border border-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-[#47645a] text-white border-none disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
}