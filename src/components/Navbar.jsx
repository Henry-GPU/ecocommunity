import React, { useState, useEffect, useCallback } from "react";
import "../stylesheets/Navbar.css";
import LoginRegisterModal from "./LoginRegisterModal.jsx";
import Menu from "./Menu";
import axios from 'axios';
import placeholder from '../images/placeholder.png';
import "../stylesheets/Sidebar.css"
import Sidebar from "./Sidebar.jsx";

const axiosInstance = axios.create({
  baseURL: 'https://b1b4-181-174-106-75.ngrok-free.app',
});

function Navbar({ isAuthenticated, userProfile, handleLogout, openLoginModal, userName, handleOpenSettings }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const [isLogin, setIsLogin] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  const handleUserImageClick = () => {
    if (isAuthenticated) {
      if (isMobile) {
        setIsSidebarVisible(prev => !prev);
      }
    } else {
      setModalOpen(true);
    }
  };

  const fetchProfileImage = useCallback(async () => {
    try {
      const email = userProfile?.email;
      if (email) {
        const response = await axiosInstance.get('/api/get-profile-image', {
          params: { email: email }
        });
        if (response.data.profileImage) {
          setProfileImage(`https://b1b4-181-174-106-75.ngrok-free.app/uploads/${response.data.profileImage}`);
        } else {
          setProfileImage(placeholder);
        }
      }
    } catch (error) {
      console.error('Error al obtener la imagen del perfil:', error);
      setProfileImage(placeholder);
    }
  }, [userProfile?.email]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileImage();
    }
  }, [isAuthenticated, fetchProfileImage]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMode = () => {
    setIsLogin(prevIsLogin => !prevIsLogin);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  return (
    <div>
      <div className="navbar-container">
        <div className="logo-container">Ecocommunity</div>
        <div className="navbar-buttons-container">
          {isAuthenticated ? (
            <>
              <div className="user-image-container">
                <img
                  className="user-image"
                  src={profileImage}
                  alt="Profile"
                  onClick={handleUserImageClick}
                />
              </div>
              {!isMobile && (
                <div className="menu-button-container" onClick={toggleSidebar}>
                  <div className="menu-bar" />
                  <div className="menu-bar" />
                  <div className="menu-bar" />
                </div>
              )}
            </>
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

      {isMobile && isSidebarVisible && (
        <Menu
          profileImage={profileImage}
          onClose={() => setIsSidebarVisible(false)}
          onLogout={handleLogout}
          userName={userName}
          handleOpenSettings={handleOpenSettings}
        />
      )}

      {!isMobile && isSidebarVisible && (
       <Sidebar
       profileImage={profileImage}
       onClose={()=> setIsSidebarVisible(false)}
       onLogout={handleLogout}
       userName={userName}
       handleOpenSettings={handleOpenSettings}
       />
      )}

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
