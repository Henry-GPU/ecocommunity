import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../stylesheets/UsersDashboard.css";
import placeholder from '../images/placeholder.png';
import { Link, useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import url from "./serveo";


function UsersDashboard({currentEmail}) {
    const [users, setUsers] = useState([]);
    const loadUsers = async() =>{
        try{
            const response = await axios.get(`${url}/api/get-users`);
            setUsers(response.data);
        }catch(error){
            console.error('Error al cargar los usuarios:', error);
        }
    };
    useEffect (() =>{
        loadUsers();
    })
  return (
    <div className="users-dashboard-container">
        <Link 
            to='/admin-dashboard'
            className="admin-dashboard-back-button">
                ←
        </Link>
        <div className="users-dashboard-content">
            {users.map((user) => (
                <Link to={`user/${user.Id}`} className="users-dashboard-item" key={user.Id}>
                    <div className="users-dashboard-item-id">{user.Id}</div>
                    <div className="dashboard-item-photo-container">
                        <img src={user.User_Photo ? `${url}/uploads/${user.User_Photo}` : placeholder}></img>
                    </div>
                    <div className="dashboard-item-fact">{user.User_Name}</div>
                    <div className="dashboard-item-fact">{user.Email}</div>
                    <div className="dashboard-item-fact">{user.Role}</div>
                </Link>       
            ))}
        </div>
    </div>
  );
}

export default UsersDashboard;
