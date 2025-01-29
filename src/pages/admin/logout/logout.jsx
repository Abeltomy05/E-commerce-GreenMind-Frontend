import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {logout} from "../../../redux/adminSlice";
import "./logout.scss"
import api from '../../../utils/adminAxiosConfig';

const LogoutPage = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const handleLogout = async() => {
      try{
      setIsLoggingOut(true);
      await api.post('/admin/logout');


        dispatch(logout())
        console.log('Logged out successfully');

    }catch(error){
           console.error('Logout error:', error);
            toast.error('Error during logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
  }
    };
  
    return (
      <div className="logout-page">
        <div className="logout-container">
          <h1>Ready to Leave?</h1>
          <p>We hope to see you again soon!</p>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    );
  };
  
  export default LogoutPage;