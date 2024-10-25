import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../stylesheets/CommunitiesDashboard.css";
import placeholder from '../images/placeholder.png';
import { Link, useNavigate } from "react-router-dom";
import url from "./serveo";

function CommunitiesDashboard({}) {
    const [communities, setCommunities] = useState([]);
        
    const loadCommunities = async() =>{
        try{
            const response = await axios.get(`${url}/api/get-all-communities`);
            setCommunities(response.data);
        }catch(error){
            console.error('Error al cargar los usuarios:', error);
        }
    };
    useEffect (() =>{
        loadCommunities();
    })
  return (
    <div className="communities-dashboard-container">
        <div className="communities-dashboard-content">
            {communities.map((community) => (
                <div className="communities-dashboard-item" key ={community.Id}>
                    <div className="communities-dashboard-item-id">{community.Id}</div>
                    <div className="dashboard-item-fact">{community.Name}</div>
                    <div className="dashboard-item-fact">{community.Country}</div>
                    <div className="dashboard-item-fact">{community.State}</div>
                    <div className="dashboard-item-fact">{community.City}</div>
                </div>
            ))}
        </div>
    </div>
  );
}

export default CommunitiesDashboard;

