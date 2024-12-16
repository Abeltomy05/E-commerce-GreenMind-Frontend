import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import './editAddress.scss';

const EditAddressModal = ({ onClose, address, userId }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    Address: '',
    country: '',
    state: '',
    district: '',
    pincode: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName || '',
        city: address.city || '',
        Address: address.Address || '',
        country: address.country || '',
        state: address.state || '',
        district: address.district || '',
        pincode: address.pincode || '',
        phone: address.phone || '',
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/user/updateaddress/${address._id}`, {
        ...formData,
        user: userId,
      });
      console.log('Address updated:', response.data);
      toast.success('Address updated successfully');
      onClose(true); // Close modal and trigger refresh
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  return (
    <div className="edit-address-modal">
      <div className="modal-content">
        <button className="close-button" onClick={() => onClose(false)}>
          <X size={24} />
        </button>
        <h2>Edit Address</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Address">Address</label>
            <input
              type="text"
              id="Address"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault">Set as default address</label>
          </div>
          <button type="submit" className="submit-button">Update Address</button>
        </form>
      </div>
    </div>
  );
};

export default EditAddressModal;

