import React, { useState, useRef, useEffect } from "react";
import { UserCircle2, LogOut, User, Settings } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/authSlice"
import { useSelector, useDispatch } from 'react-redux';
import axios from "axios";
import "./header-login.scss";

const HeaderLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = useSelector((state) => state.auth.user);

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, {
        withCredentials: true
      });
      dispatch(logout());
      navigate('/user/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const toggleDropdown = (e) => {
    e.stopPropagation();
    console.log("dropdown clicked");
    
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <h1>GREENMIND</h1>
        </div>

        {/* Navigation Links */}
        {user && (
          <nav className="header-nav">
            <ul>
              <li><a onClick={() => handleNavigate('/user/home')}>Home</a></li>
              <li><a onClick={() => handleNavigate('/user/shop')}>Shop</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
        )}

        {/* Icons Section */}
        {user && (
          <div className="header-icons">
            <a href="#" className="icon">
              <i className="fas fa-search"></i>
            </a>
            <a href="#" className="icon">
              <i className="far fa-heart"></i>
            </a>
            <a href="#" className="icon" onClick={() => handleNavigate('/user/cart')}>
              <i className="fas fa-shopping-cart"></i>
            </a>

            <div className="profile-dropdown" ref={dropdownRef}>
              <UserCircle2 className="profile-icon" onClick={(e)=>toggleDropdown(e)} />
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <a onClick={() => handleNavigate('/user/account')}>
                    <User size={16} />
                    Your Account
                  </a>
                  <a onClick={() => handleNavigate('/user/settings')}>
                    <Settings size={16} />
                    Settings
                  </a>
                  <a onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderLogin;

