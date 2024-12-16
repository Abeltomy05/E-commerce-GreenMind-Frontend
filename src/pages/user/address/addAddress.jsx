import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import './address.scss';
import axios from 'axios';

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:3000/user/addnewaddress/${userId}`, formData)
            toast.success("Successfully Added New Address")
            console.log('New address added:', response.data);
            onClose();
        } catch (error) {
            console.error('Error adding new address:', error.response ? error.response.data : error.message);
            toast.error('Failed To Add New Address')
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
                    <div className="form-group">
                        <label htmlFor="pincode">Pin Code</label>
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
