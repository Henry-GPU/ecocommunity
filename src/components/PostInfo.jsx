import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../stylesheets/PostsInfo.css';
import axios from "axios";
import placeholder from '../images/placeholder.png';
import L, { Handler } from 'leaflet';
import url from './serveo';
import { Link } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: url
});

function Post({ postCommunity, userEmail, name, time, comment, postImage, location, userAuthEmail, post, postStatus, id }) {
  const [userImage, setUserImage] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [verificationsCount, setVerificationsCount] = useState(0);

  const fetchUserImage = useCallback(async () => {
    try {
      const email = userEmail;
      if (email) {
        const response = await axiosInstance.get('/api/get-profile-image', {
          params: { email: email }
        });
        if (response.data.profileImage) {
          setUserImage(`${url}/uploads/${response.data.profileImage}`);
        } else {
          setUserImage(placeholder);
        }
      }
    } catch (error) {
      console.error('Error al obtener la imagen del perfil:', error);
      setUserImage(placeholder);
    }
  }, [userEmail]);

  useEffect(() => {
    setLikesCount(post.likes);
    setVerificationsCount(post.verifications);
    fetchUserImage();
  }, [fetchUserImage, userAuthEmail]);

  const changeStatus = async () => {
    try {
        let status;
        if(postStatus){
            status = 0;
        }else{
            status = 1;
        }
        const response = await axios.put(`${url}/api/post-change-status`, {
            id: id, 
            status: status
        });
    } 
    catch (error) {
        console.error('Error al cambiar el status', error);
    }
  }


  return (
    <div className="admin-post-info-container">
      <Link 
        to='/admin-dashboard'
        className="admin-dashboard-back-button">
          ←
      </Link>
      <div className="admin-post-info-content">
        <div className="admin-user-post-info-photo">
            <img src={`${userImage}`}></img>
        </div>
        <div className="admin-user-post-info-username">{name}</div>
        <p className="admin-user-post-info-email">{userEmail}</p>
        <ul className="admin-post-info">
                <li>Comentario: 
                    <p className="admin-post-info-fact">{comment}</p>
                </li>
                <li>Fecha de creacion:
                  <p className="admin-post-info-fact">{time}</p>
                </li>
                <li>Coordenadas:
                    <p className="admin-post-info-fact">{location.lat},{ location.lng}</p>
                </li>
                <li>Comunidad:
                    <p className="admin-post-info-fact" >
                            {postCommunity ? postCommunity: "Global"}
                    </p>
                </li>
                <li>Likes:
                    <p className="admin-post-info-fact">{likesCount}</p>
                </li>
                <li>Verificaciones:
                    <p className="admin-post-info-fact">{verificationsCount}</p>
                </li>
                <li>Status:
                    <p className="admin-post-info-fact" 
                        style={postStatus ?{color: '#0ab48a'} : {color:"red"}}>
                            {postStatus ? "Activo": "Inactivo"}
                    </p>
                </li>
                
                
        </ul>
        <img className='admin-post-info-photo' src={`${url}/uploads/${postImage}`}></img>
        <div className="admin-post-info-actions-container">
            
            <button className="change-status-button"
                onClick={changeStatus}
                style={postStatus ? {backgroundColor: "#f56060"} : 
                    {backgroundColor: "#2ba0b7"}}>
                    {postStatus ? "DESACTIVAR POST" : "ACTIVAR POST"}
            </button>
        </div>
    </div>
</div>
  );
}

export default Post;
