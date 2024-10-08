// Sidebar.jsx
import React from "react";
import "../stylesheets/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar({ profileImage, onClose, onLogout, userName }) {
  return (
    <div className="sidebar visible">
      <div className="sidebar-profile-section">
        <img className="profile-image" src={profileImage} alt="Profile" />
        <label className="sidebar-username-label">{userName}</label>
      </div>
      <div className="menu-options">
        <div >Perfil</div>
        <div >Ayuda</div>
        <Link to="/settings" onClick={onClose}>
        <div>Ajustes</div></Link>
        <div onClick={() => {
          onLogout();
          onClose();
        }}><Link to="/">Cerrar Sesión</Link></div>
      </div>
    </div>
  );
}

export default Sidebar;
