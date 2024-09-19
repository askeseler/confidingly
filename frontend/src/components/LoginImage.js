import React, { useState, useEffect } from 'react';
import './LoginImage.css';

const LoginImage = ({ userIcon, loginOpen, setLoginOpen }) => {

  const handleImageClick = () => {
    setLoginOpen(true);
  };

  const handleOverlayClick = (event) => {
    const loginBox = document.querySelector('.login-box');
    if (event.target !== loginBox && !loginBox.contains(event.target)) {
      setLoginOpen(false);
    }
  };

  return (
    <div>
      {/* Use the passed SVG as the source for the image */}
      <img
        src={userIcon}
        alt="User Icon"
        className="clickable-image"
        onClick={handleImageClick}
        style={{ width: "75px", height: "75px" }}
      />

      {loginOpen && (
        <div className="overlay" onClick={handleOverlayClick}>
          <div className='centered-circle'></div>
          <div className="login-box">
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Name"
              className="input-field"
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
            />
            {/* Add the green login button */}
            <button className="login-button">Login</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginImage;
