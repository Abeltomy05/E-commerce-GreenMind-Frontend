import React, { useState, useRef, useEffect } from "react";
import { UserCircle2, LogOut, User, Settings, Search, Heart, ShoppingCartIcon, Menu, X,Leaf } from 'lucide-react'
import { useNavigate,Link } from "react-router-dom";
import { logout } from "../../redux/userSlice"
import { useSelector, useDispatch } from 'react-redux';
import axios from "axios";
import Badge from '@mui/material/Badge';
import "./header-login.scss";
import axiosInstance from "../../utils/axiosConfig";
import Cookies from 'js-cookie';
import {persistor} from '../../redux/store'

const HeaderLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const cartCount = useSelector((state)=>state.cart.cartCount)

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const COOKIE_OPTIONS = {
    secure: true, // Only transmitted over HTTPS
    sameSite: 'strict', // Protects against CSRF
    path: '/' // Available across all pages
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get('accessToken');

      await axiosInstance.post('/auth/logout', {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`
        }
      });

      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      dispatch(logout());
      await persistor.purge();

      navigate('/user/login');
    } catch (error) {
      console.error('Logout error:', error);
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      dispatch(logout());
      await persistor.purge();
    navigate('/user/login');
    }
  }

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        {user &&<h1 className="text-3xl font-bold flex items-center cursor-pointer"
        onClick={() => handleNavigate('/user/home')}
        >
            <Leaf className="mr-1" />
            Green Mind
          </h1>}

          {!user && <h1 className="text-3xl font-bold flex items-center cursor-pointer"
        onClick={() => handleNavigate('/')}
        >
            <Leaf className="mr-1" />
            Green Mind
          </h1>}

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </div>

        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
          {/* Navigation Links for landing pages*/}
        {!user && (
            <div className="flex-1 flex justify-center">
            <nav className="header-nav">
              <ul>
                <li><a onClick={() => handleNavigate('/')}>Home</a></li>
                <li><a onClick={() => handleNavigate('/shop')}>Shop</a></li>
                <li><a onClick={() => handleNavigate('/about')}>About</a></li>
                <li><a onClick={() => handleNavigate('/contact')}>Contact</a></li>
              </ul>
            </nav>
            </div>
          )}
          {/* Navigation Links */}
          {user && (
            <div className="flex-1 flex justify-center">
            <nav className="header-nav">
              <ul>
                <li><a onClick={() => handleNavigate('/user/home')}>Home</a></li>
                <li><a onClick={() => handleNavigate('/user/shop')}>Shop</a></li>
                <li><a onClick={() => handleNavigate('/about')}>About</a></li>
                <li><a onClick={() => handleNavigate('/contact')}>Contact</a></li>
              </ul>
            </nav>
            </div>
          )}


           {/* Icons Section for landing page*/}
           {!user && (
            <div className="header-icons">
              <div className="profile-dropdown" ref={dropdownRef}>
                <div className="icon-wrapper" onClick={toggleDropdown}>
                  <UserCircle2 className="profile-icon" />
                  <span className="icon-label">Account</span>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <a onClick={() => handleNavigate('/user/login')}>
                      <User size={16} />
                      Login
                    </a>
                    <a onClick={() => handleNavigate('/user/signup')}>
                      <User size={16} />
                      SignUp
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Icons Section */}
          {user && (
            <div className="header-icons">
              <div className="icon-wrapper" onClick={() => handleNavigate('/user/wishlist')}>
                <Heart className="icon" />
                <span className="icon-label">Wishlist</span>
              </div>
              <div className="icon-wrapper" onClick={() => handleNavigate('/user/cart')}>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartIcon className="icon" />
                </Badge>
                <span className="icon-label">Cart</span>
              </div>
              <div className="profile-dropdown" ref={dropdownRef}>
                <div className="icon-wrapper" onClick={toggleDropdown}>
                  <UserCircle2 className="profile-icon" />
                  <span className="icon-label">Account</span>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <a onClick={() => handleNavigate('/user/account')}>
                      <User size={16} />
                      Your Account
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
      </div>
    </header>
  );
};

export default HeaderLogin;
