import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import './address.scss';
import axioInstence from '../../../utils/axiosConfig';

const AddAddressModal = ({ onClose, userId}) => {
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

    const validateForm = () => {
        const newErrors = {};

        // Validate fullName
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        // Validate Address
        if (!formData.Address.trim()) {
            newErrors.Address = 'Address is required';
        }

        // Validate city
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        // Validate district
        if (!formData.district.trim()) {
            newErrors.district = 'District is required';
        }

        // Validate state
        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        // Validate country
        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        // Validate pincode
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pin code is required';
        } else {
            const pincodeRegex = /^(?!0{6})\d{6}$/;
            if (!pincodeRegex.test(formData.pincode)) {
                newErrors.pincode = 'Pin code must be 6 digits and cannot be all zeros';
            }
        }

        // Validate phone
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
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

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await axioInstence.post(`/user/addnewaddress/${userId}`, formData);
                toast.success("Successfully Added New Address");
                console.log('New address added:', response.data);
                onClose(true);
            } catch (error) {
                console.error('Error adding new address:', error.response ? error.response.data : error.message);
                toast.error('Failed To Add New Address');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="add-address-modal">
                <button className="close-button" onClick={onClose}>
                    <X size={24} />
                </button>
                <h2>Add New Address</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="Address">Address</label>
                        <input
                            type="text"
                            id="Address"
                            name="Address"
                            value={formData.Address}
                            onChange={handleChange}
                        />
                        {errors.Address && <span className="error-message">{errors.Address}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                        {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="district">District</label>
                        <input
                            type="text"
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                        />
                        {errors.district && <span className="error-message">{errors.district}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                        />
                        {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                        />
                        {errors.country && <span className="error-message">{errors.country}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="pincode">Pin Code</label>
                        <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="Enter 6-digit pincode"
                        />
                        {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter 10-digit phone number"
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
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
                    <button type="submit" className="submit-button">Add Address</button>
                </form>
            </div>
        </div>
    );
};

export default AddAddressModal;
