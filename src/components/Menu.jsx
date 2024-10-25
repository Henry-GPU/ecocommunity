
import React from 'react';
import '../stylesheets/Menu.css';
import { Link } from 'react-router-dom';
import '../stylesheets/ToolBar.css'
import url from './serveo';

function Menu({ openCreateCommunityModal, profileImage, onClose, onLogout, userName, handleOpenSettings, userRole }) {
  return (
    <div className="mobile-toolbar-container">
      <button className="back-button" onClick={onClose}>←</button>
      <div className='toolbar-buttons-container'>
        <Link to='/'
          className='mobile-profile-toolbar-section'
          onClick={() => {
            onClose();
            }}>
          <img className='mobile-profile-toolbar-image' src={`${profileImage}`}></img>
          <p className='mobile-profile-toolbar-username'>{userName}</p>
        </Link>
        {(userRole === 1 || userRole === 2) && (
            <Link 
              className='toolbar-button'
              to="/admin-dashboard" 
              onClick={() => {
              onClose();
              }}>
              <img className='toolbar-icon' src={`${url}/icons/admin-dashboard.png`}></img>
              <p>Admin Dashboard</p>
            </Link>)}
            <Link 
              className='toolbar-button'
              to="/settings" 
              onClick={() => {
              onClose();
              }}>
              <img className='toolbar-icon' src={`${url}/icons/settings.png`}></img>
              <p>Ajustes de perfil</p>
            </Link>
            <Link 
              className='toolbar-button'
              to="/communities" 
              onClick={() => {
              onClose();
              }}>
              <img className='toolbar-icon' src={`${url}/icons/communities.png`}></img>
              <p>Comunidades</p>
            </Link>
            <div className='toolbar-button'
                        onClick={openCreateCommunityModal}>
                            <img className='toolbar-icon' src={`${url}/icons/communities.png`}></img>
                            <p>Crear una comunidad</p>
                    </div>
            <Link 
              className='toolbar-button'
              to="/" 
              onClick={() => {
              onClose();
              onLogout();
              }}>
              <img className='toolbar-icon' src={`${url}/icons/logout.png`}></img>
              <p>Cerrar sesión</p>
            </Link>
      </div>
    </div>
  );
}

export default Menu;
