import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {logout} from "../../../redux/authSlice";
import "./logout.scss"

const LogoutPage = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
  
    const dispatch = useDispatch()

    const handleLogout = () => {
      setIsLoggingOut(true);
      setTimeout(() => {
        dispatch(logout())
        console.log('Logged out successfully');
      }, 2000);
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