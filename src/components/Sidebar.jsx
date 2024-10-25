// Sidebar.jsx
import React from "react";
import "../stylesheets/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar({ profileImage, onClose, onLogout, userName, userRole }) {
  return (
    <div className="sidebar visible">
      <div className="sidebar-profile-section">
        <img className="profile-image" src={profileImage} alt="Profile" />
        <label className="sidebar-username-label">{userName}</label>
      </div>
      <div className="menu-options">
        {(userRole === 1 || userRole === 2) && 
        (<Link to="/admin-dashboard" onClick={onClose} ><div>Dashboard</div></Link>)}    
        <Link to="/profile"><div >Perfil</div></Link>
        <Link to="/help"><div >Ayuda</div></Link>
        <Link to="/settings" onClick={onClose}>
        <div>Ajustes</div></Link>
        <Link to="/" onClick={() => {
          onLogout();
          onClose();
        }}>Cerrar Sesión</Link>
      </div>
    </div>
  );
}

export default Sidebar;
