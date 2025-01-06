import React from 'react';
import { Package, Lock, Gift, MapPin, Building2, CreditCard, Wallet, User } from 'lucide-react';
import './userAccount.scss';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import { useNavigate } from 'react-router-dom';
import axioInstence from '../../../utils/axiosConfig';

export default function AccountDashboard() {
  const navigate = useNavigate();

  const accountSections = [
    {
      icon: <Package size={24} />,
      title: "Your Orders",
      description: "Track, return, or buy things again",
      color: "#FF9900",
      path: "/user/orders"
    },
    {
      icon: <User size={24} />,
      title: "Edit Profile",
      description: "Edit name, mobile number and details",
      color: "#1E88E5",
      path: "/user/profile"
    },
    {
      icon: <Gift size={24} />,
      title: "View Wishlist",
      description: "View wishlisted products",
      color: "#00A650",
      path: "/user/wishlist"
    },
    {
      icon: <MapPin size={24} />,
      title: "Your Addresses",
      description: "Edit addresses for orders and gifts",
      color: "#E53935",
      path: "/user/address"
    },
    // {
    //   icon: <Building2 size={24} />,
    //   title: "Your business account",
    //   description: "Sign up for free to save up to 28% with GST invoice and bulk discounts and purchase on credit.",
    //   color: "#8E24AA",
    //   path: "/user/business-account"
    // },
    {
      icon: <CreditCard size={24} />,
      title: "Your Cart",
      description: "View and buy products from cart.",
      color: "#FB8C00",
      path: "/user/cart"
    },
    {
      icon: <Wallet size={24} />,
      title: "Wallet",
      description: "Add money to your balance",
      color: "#43A047",
      path: "/user/wallet"
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <div className="page-wrapper">
        <HeaderLogin />
        <div className="account-dashboard">
          <h1>Your Account</h1>
          <div className="dashboard-grid">
            {accountSections.map((section, index) => (
              <div
                key={index}
                className="dashboard-card"
                style={{ '--card-color': section.color }}
                onClick={() => handleNavigate(section.path)}
              >
                <div className="card-content">
                  <div className="icon-wrapper">
                    {section.icon}
                  </div>
                  <div className="text-content">
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
