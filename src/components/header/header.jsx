import React from "react";
import "./header.scss";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <h1>GREENMIND</h1>
        </div>

        {/* Navigation Links */}
        <nav className="header-nav">
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>

        {/* Icons Section */}
        <div className="header-icons">
          <a href="#" className="icon">
            <i className="fas fa-search"></i>
          </a>
          <a href="#" className="icon">
            <i className="far fa-heart"></i>
          </a>
          <a href="#" className="icon">
            <i className="fas fa-shopping-cart"></i>
          </a>
          <a href="#" className="profile-icon">
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="profile-img"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
