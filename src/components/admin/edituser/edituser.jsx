import React, { useState } from 'react';
import './edituser.scss';


const EditUser = ({ user ,onSave}) => {
  const [firstName, setFirstName] = useState(user.firstname || '');
  const [lastName, setLastName] = useState(user.lastname || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  


  const handleSubmit = async(e) => {
    e.preventDefault();
   
    const updatedUser = {
        _id: user._id,
        firstname: firstName,
        lastname: lastName,
        username,
        email,
        phone,
      };
    try {
        await onSave(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
      }
      
  };

  return (
    <div className="edit-user">
      <div className="user-header">
        <div className="user-avatar">
          {user.profileImage ? (
            <img src={user.profileImage}/>
          ) : (
            <span>{firstName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h2>{firstName} {lastName}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Not available"
          />
        </div>
        <div id='status-form' className="form-group">
        <label htmlFor="phone">Status</label>
        <span className={`status-badge ${user.isBlocked ? "blocked" : "active"}`}>
                    {user.isBlocked ? "Blocked" : "Active"}
         </span>
        </div>
        <button type="submit" className="submit-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default EditUser;

