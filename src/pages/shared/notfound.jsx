import React from 'react';
import './notfound.scss';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="content">
        <h1 className="error-code">404</h1>
        <h2 className="error-message">Not Found</h2>
        <p className="error-description">Oops! The page you're looking for doesn't exist.</p>
        <a href="/user/login" className="home-button">Go Back Home</a>
      </div>
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;

