import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../stylesheets/AdminDashboard.css";
import placeholder from '../images/placeholder.png';
import { Link, useNavigate } from "react-router-dom";
import url from "./serveo";


function AdminDashboard({}) {

  return (
    <div className="admin-dashboard-container">
        <Link 
            to='/'
            className="admin-dashboard-back-button">
                ←
        </Link>
        <div className="dashboard-content">
            <Link to='/admin-users-dashboard' className="dashboard-button">
                <div className="dashboard-button-icon-container">
                    <img src={`${url}/icons/manage-users.png`}></img>
                </div>
                <div className="dashboard-button-name">Administrar Usuarios</div>
            </Link>
            <Link to='/admin-posts-dashboard' className="dashboard-button">
                <div className="dashboard-button-icon-container">
                    <img src={`${url}/icons/manage-posts.png`}></img>
                </div>
                <div className="dashboard-button-name">Administrar Publicaciones</div>
            </Link>
            <Link to='/admin-communities-dashboard' className="dashboard-button">
                <div className="dashboard-button-icon-container">
                    <img src={`${url}/icons/manage-communities.png`}></img>
                </div>
                <div className="dashboard-button-name">Administrar Comunidades</div>
            </Link>
        </div>
    </div>
  );
}

export default AdminDashboard;
