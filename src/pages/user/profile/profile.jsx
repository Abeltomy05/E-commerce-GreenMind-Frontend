import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Camera, Lock } from 'lucide-react';
import './profile.scss';
import ProfileImg from "../../../assets/images/user.png"
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import axioInstence from '../../../utils/axiosConfig';

const ProfileSettings = () => {
  
  const user = useSelector((state) => state.user.user);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    profileImage: ''
  });

  const [address, setAddress] = useState({
    city: '',
    country: '',
    state: '',
    district: '',
    pincode: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axioInstence.get(`/user/profile/${user.id}`);

        console.log('Full response:', response);
        const {  userData, address } = response.data;
       console.log(userData,address)
        setFormData({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          profileImage: userData.profileImage || ''
        });

        setAddress({
          city: address?.city || '',
          country: address?.country || '',
          state: address?.state || '',
          district: address?.district || '',
          pincode: address?.pincode || ''
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data');
        setLoading(false);
        console.error('Error:', err);
      }
    };

    fetchProfileData();
  }, [user.id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {

      await axioInstence.put(`/user/profileupdate/${user.id}`, {
        formData,
        address
      });


      toast.success('Profile updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || "Failed to update profile")
    }
  };


  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      
      const response = await axioInstence.put(`/user/change-password/${user.id}`, 
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }
      );

      toast.success(response.data.message || 'Password changed successfully');
      console.log("password change success")
      // Reset password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
      console.log("password change error")
    }
  };



  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Check file size (optional: limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
  
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and webp files are allowed');
      return;
    }
  
    try {
      // First, get the Cloudinary signature
      const signatureResponse = await axioInstence.get('/admin/generate-upload-url');
      const { signature, timestamp, uploadPreset, apiKey, cloudName } = signatureResponse.data;
  
      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('upload_preset', uploadPreset);
  
      // Upload to Cloudinary
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, 
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      // Update profile with new image URL
      const imageUrl = cloudinaryResponse.data.secure_url;
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
      await axioInstence.put(`/user/profileImageupdate/${user.id}`, {
          profileImage: imageUrl
      });
  
      toast.success('Profile image uploaded successfully');
    } catch (err) {
      console.error('Profile image upload error:', err);
      toast.error('Failed to upload profile image');
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
    <HeaderLogin/>
    <div className="profile-settings">
      <section className="account-section">
        <h2>Account Settings</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="profile-header">
            <div className="profile-image-container">
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage}
                  alt="Profile" 
                  className="profile-image-preview"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "/assets/images/user.png"; 
                  }}
                />
              ) : (
                <div className="profile-image-placeholder">
                  <Camera size={40} />
                  <span>Choose an image</span>
                </div>
              )}
              <input 
                type="file" 
                id="profileImageUpload" 
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleProfileImageUpload}
              />
              <button 
                type="button" 
                className="change-photo-button"
                onClick={() => document.getElementById('profileImageUpload').click()}
              >
                <Camera size={25} className='camera-icon'/>
                <span>Change Photo</span>
              </button>
            </div>
            <div className="name-fields">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
            />
          </div>

          <div className="location-fields">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={address.country}
                onChange={handleAddressChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleAddressChange}
              />
            </div>
            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={address.district}
                onChange={handleAddressChange}
              />
            </div>
            <div className="form-group">
              <label>Pin Code</label>
              <input
                type="text"
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
              />
            </div>
          </div>

          
         <div className="btn-grp">
          <button type="submit" id='save-btn' className="save-button">Save Changes</button>
          <div className="form-group">
            <button 
              type="button" 
              className="password-toggle-button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Lock size={20} />
              <span>{showPasswordSection ? 'Cancel ' : 'Change Password'}</span>
            </button>
          </div>
          </div>
        </form>
      </section>
      {showPasswordSection && (
      <section className="password-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group password-group">
            <label>Current Password</label>
            <div className="password-input">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="toggle-password"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group password-group">
            <label>New Password</label>
            <div className="password-input">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="toggle-password"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
           
          </div>

          <div className="form-group password-group">
            <label>Confirm Password</label>
            <div className="password-input">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="toggle-password"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="save-button">Change Password</button>
        </form>
      </section>)}
    </div>
      <Footer/>
    </>
  );
};

export default ProfileSettings;

