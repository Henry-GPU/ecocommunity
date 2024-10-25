import React, { useState, useEffect, useCallback } from "react";
import "../stylesheets/Navbar.css";
import LoginRegisterModal from "./LoginRegisterModal.jsx";
import Menu from "./Menu";
import axios from 'axios';
import placeholder from '../images/placeholder.png';
import "../stylesheets/Sidebar.css"
import Sidebar from "./Sidebar.jsx";
import url from "./serveo.js";
import { Link } from "react-router-dom";
import CreateCommunityModal from "./CreateCommunityModal.jsx";

const axiosInstance = axios.create({
  baseURL: url,
});

function Navbar({ isAuthenticated, profileImage, fetchProfileImage, handleLogout, openLoginModal, userName, handleOpenSettings, userRole }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);

  const handleUserImageClick = () => {
    if (isAuthenticated) {
      if (isMobile) {
        setIsMenuVisible(prev => !prev);
      }
    } else {
      setModalOpen(true);
    }
  };

  useEffect(() => { 
    if (isAuthenticated) fetchProfileImage(); 
  }, [isAuthenticated, fetchProfileImage]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMenuVisible) {
      document.body.style.overflow = 'hidden';
    } else {

      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuVisible]);

  const toggleMode = () => {
    setIsLogin(prevIsLogin => !prevIsLogin);
  };

  const toggleMenu = () => {
    setIsMenuVisible(prev => !prev);
  };

  return (
    <div>
      <div className="navbar-container">
        <Link to="/" className="logo-container">Ecocommunity</Link>
        <div className="navbar-buttons-container">
          {isAuthenticated ? (
              <div className="user-image-container">
                <img
                  className="user-image"
                  src={profileImage}
                  alt="Profile"
                  onClick={handleUserImageClick}
                />
        </div>
          ) : (
            <button
              className="login-button"
              onClick={openLoginModal}
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      {isMobile && isMenuVisible &&(
        <Menu
          userRole={userRole}
          profileImage={profileImage}
          onClose={() => setIsMenuVisible(false)}
          onLogout={handleLogout}
          userName={userName}
          handleOpenSettings={handleOpenSettings}
          openCreateCommunityModal={() => setIsCreateCommunityModalOpen(true)}
        />
      )}
      {isCreateCommunityModalOpen && 
      <CreateCommunityModal
        onClose={() => {setIsCreateCommunityModalOpen(false); setIsMenuVisible(false);}}
      />}
      {isModalOpen && (
        <LoginRegisterModal
          onClose={() => setModalOpen(false)}
          isLogin={isLogin}
          onLoginSuccess={() => {
            fetchProfileImage();
          }}
          toggleMode={toggleMode}
        />
      )}
    </div>
  );
}

export default Navbar;
