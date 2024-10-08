
import React from 'react';
import '../stylesheets/Menu.css';
import { Link } from 'react-router-dom';

function Menu({ profileImage, onClose, onLogout, userName, handleOpenSettings }) {
  return (
    <div className="menu-container">
      <button className="back-button" onClick={onClose}>←</button>
      <div className="profile-section">
        <img
          className="profile-image"
          src={profileImage}
          alt="Profile"
        />
        <label className="username-label">{userName}</label>
      </div>
      <ul className="menu-options">
        <li><a href="">Perfil</a></li>
        <li>
          <a 
            href=""
            onClick={() => {onClose();}}>           
            <Link
              to="/settings">
                Ajustes
            </Link>
          </a></li>
        <li><a href="">Ayuda</a></li>
        <li><a 
          href="" 
          onClick={() => {
            onLogout();
            onClose();
            }
          }>
            <Link to="/">Cerrar Sesión</Link>
          </a></li>
      </ul>
    </div>
  );
}

export default Menu;
