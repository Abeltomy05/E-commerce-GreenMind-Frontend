import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MapPin, Phone, Mail, Edit, User, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import './address.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import AddAddressModal from './addAddress.jsx';
import EditAddressModal from './editAddress.jsx';
import DeleteConfirmationModal from './confirmdelete.jsx';

const AddressManagement = () => {
    const user = useSelector((state) => state.auth.user);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addressToDelete, setAddressToDelete] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, [user.id]);

    const fetchAddresses = async () => {
        try {
            if (!user || !user.id) {
                toast.error('User information not available');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:3000/user/addressdata/${user.id}`);
            console.log('Addresses response:', response.data);
            setAddresses(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            toast.error('Failed to fetch addresses');
            setError(err);
            setLoading(false);
        }
    };

    const handleAddAddress = () => {
        setIsAddModalOpen(true);
    };

    const handleEditAddress = (address) => {
        setSelectedAddress(address);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (addressId) => {
        setAddressToDelete(addressId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://localhost:3000/user/deleteaddress/${addressToDelete}`);
            toast.success('Address deleted successfully');
            fetchAddresses();
        } catch (err) {
            console.error('Error deleting address:', err);
            toast.error('Failed to delete address');
        } finally {
            setIsDeleteModalOpen(false);
            setAddressToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setAddressToDelete(null);
    };

    const handleCloseModal = (refresh = false) => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedAddress(null);
        if (refresh) {
            fetchAddresses();
        }
    };

    if (loading) return <div>Loading addresses...</div>;
    if (error) return <div>Error loading addresses</div>;

    return (
        <>
            <HeaderLogin />
            <div className="address-management">
                <div className="header">
                    <h1>My Addresses</h1>
                </div>

                <div className="addresses-grid">
                    {addresses.map((address) => (
                        <div key={address._id} className="address-card">
                            <div className="heading">
                                <h2>{address.isDefault ? 'DEFAULT SHIPPING ADDRESS' : 'SHIPPING ADDRESS'}</h2>
                                <div className="address-actions">
                                    <Edit size={18} className='new-btns' onClick={() => handleEditAddress(address)} />
                                    <Trash2 size={18} className='new-btns delete-btn' onClick={() => handleDeleteClick(address._id)} />
                                </div>
                            </div>
                            <div className="address-content">
                                <div className="name">{address.fullName ? address.fullName : user.name}</div>
                                <div className="address-details">
                                    <MapPin size={16} />
                                    <div>
                                        <p>{address.Address}</p>
                                        <p>{`${address.city}, ${address.district}`}</p>
                                        <p>{`${address.state}, ${address.country}`}</p>
                                        <p>Pin: {address.pincode}</p>
                                    </div>
                                </div>

                                <div className="contact-info">
                                    <div className="phone">
                                        <Phone size={16} />
                                        <span>Phone Number: {address.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="add-address-card" onClick={handleAddAddress}>
                        <Plus size={24} />
                        <span>Add New Address</span>
                    </button>
                </div>
            </div>
            <Footer />
            {isAddModalOpen && <AddAddressModal onClose={handleCloseModal} userId={user.id} />}
            {isEditModalOpen && <EditAddressModal onClose={handleCloseModal} address={selectedAddress} userId={user.id} />}
            {isDeleteModalOpen && (
                <DeleteConfirmationModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}
        </>
    );
};

export default AddressManagement;

