import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import './editAddress.scss';
import axioInstence from '../../../utils/axiosConfig';

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

  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
      const newErrors = {};
      const requiredFields = ['fullName', 'city', 'Address', 'country', 'state', 'district', 'pincode', 'phone'];
      
      // Check all required fields
      requiredFields.forEach(field => {
          if (!formData[field] || !formData[field].trim()) {
              newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          }
      });

      // Validate pincode
      if (formData.pincode.trim()) {
          const pincodeRegex = /^(?!0{6})\d{6}$/;
          if (!pincodeRegex.test(formData.pincode)) {
              newErrors.pincode = 'Pin code must be 6 digits and cannot be all zeros';
          }
      }

      // Validate phone
      if (formData.phone.trim()) {
          const phoneRegex = /^(?!0{10})[6-9]\d{9}$/;
          if (!phoneRegex.test(formData.phone)) {
              newErrors.phone = 'Enter valid 10-digit phone number starting with 6-9';
          }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      let newValue = value;

      // Special handling for phone and pincode
      if (name === 'phone') {
          newValue = value.replace(/\D/g, '').slice(0, 10);
      }
      if (name === 'pincode') {
          newValue = value.replace(/\D/g, '').slice(0, 6);
      }

      setFormData(prevState => ({
          ...prevState,
          [name]: type === 'checkbox' ? checked : newValue
      }));

      // Clear error for this field
      if (errors[name]) {
          setErrors(prev => ({
              ...prev,
              [name]: ''
          }));
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      // Trim all text fields before validation
      const trimmedFormData = Object.keys(formData).reduce((acc, key) => {
          acc[key] = typeof formData[key] === 'string' ? formData[key].trim() : formData[key];
          return acc;
      }, {});

      setFormData(trimmedFormData);

      if (validateForm()) {
          try {
              const response = await axioInstence.put(`/user/updateaddress/${address._id}`, {
                  ...trimmedFormData,
                  user: userId,
              });

              if (response.data) {
                  toast.success('Address updated successfully');
                  onClose(true);
              }
          } catch (error) {
              console.error('Error updating address:', error);

              // Handle specific validation errors from backend
              if (error.response?.data?.error) {
                  const backendError = error.response.data.error;
                  if (backendError.includes('ValidationError')) {
                      toast.error('Please fill all required fields correctly');
                      
                      // Extract field-specific errors if possible
                      const fieldErrors = {};
                      const errorParts = backendError.split(',');
                      errorParts.forEach(part => {
                          const fieldMatch = part.match(/Path `(\w+)`/);
                          if (fieldMatch) {
                              const field = fieldMatch[1];
                              fieldErrors[field] = `${field} is required`;
                          }
                      });
                      setErrors(fieldErrors);
                  } else {
                      toast.error(error.response.data.message || 'Failed to update address');
                  }
              } else {
                  toast.error('Failed to update address');
              }
          }
      } else {
          toast.error('Please fill all required fields correctly');
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
                      <label htmlFor="fullName">Full Name *</label>
                      <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={errors.fullName ? 'error' : ''}
                      />
                      {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                  <div className="form-group">
                      <label htmlFor="Address">Address *</label>
                      <input
                          type="text"
                          id="Address"
                          name="Address"
                          value={formData.Address}
                          onChange={handleChange}
                          className={errors.Address ? 'error' : ''}
                      />
                      {errors.Address && <span className="error-message">{errors.Address}</span>}
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label htmlFor="city">City *</label>
                          <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className={errors.city ? 'error' : ''}
                          />
                          {errors.city && <span className="error-message">{errors.city}</span>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="district">District *</label>
                          <input
                              type="text"
                              id="district"
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              className={errors.district ? 'error' : ''}
                          />
                          {errors.district && <span className="error-message">{errors.district}</span>}
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label htmlFor="state">State *</label>
                          <input
                              type="text"
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              className={errors.state ? 'error' : ''}
                          />
                          {errors.state && <span className="error-message">{errors.state}</span>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="country">Country *</label>
                          <input
                              type="text"
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              className={errors.country ? 'error' : ''}
                          />
                          {errors.country && <span className="error-message">{errors.country}</span>}
                      </div>
                  </div>
                  <div className="form-row">
                      <div className="form-group">
                          <label htmlFor="pincode">Pincode *</label>
                          <input
                              type="text"
                              id="pincode"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleChange}
                              placeholder="Enter 6-digit pincode"
                              className={errors.pincode ? 'error' : ''}
                          />
                          {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="phone">Phone *</label>
                          <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Enter 10-digit phone number"
                              className={errors.phone ? 'error' : ''}
                          />
                          {errors.phone && <span className="error-message">{errors.phone}</span>}
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

