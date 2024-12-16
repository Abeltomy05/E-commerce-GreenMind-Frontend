import React from "react";
import "./footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Description */}
        <div className="footer-column">
          <h1 className="footer-logo">GREENMIND</h1>
          <p className="footer-description">We help you find your dream plant</p>
          <div className="footer-socials">
            <a href="#" className="social-icon">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Links - Information */}
        <div className="footer-column">
          <h2 className="footer-title">Information</h2>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Product</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        {/* Links - Company */}
        <div className="footer-column">
          <h2 className="footer-title">Company</h2>
          <ul>
            <li><a href="#">Community</a></li>
            <li><a href="#">Career</a></li>
            <li><a href="#">Our story</a></li>
          </ul>
        </div>

        {/* Links - Contact */}
        <div className="footer-column">
          <h2 className="footer-title">Contact</h2>
          <ul>
            <li><a href="#">Getting Started</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Resources</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>2023 © All Rights Reserved. Terms of use GREENMIND</p>
      </div>
    </footer>
  );
};

export default Footer;

  