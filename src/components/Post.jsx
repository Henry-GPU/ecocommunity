import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../stylesheets/Post.css';
import axios from "axios";
import placeholder from '../images/placeholder.png';
import L, { Handler } from 'leaflet';
import url from './serveo';

const axiosInstance = axios.create({
  baseURL: url
});

function Post({ userEmail, name, time, comment, postImage, location, userAuthEmail, post }) {
  const [likesCount, setLikesCount] = useState(JSON.parse(post.Likes).length);
  const [verificationsCount, setVerificationsCount] = useState(JSON.parse(post.Verifications).length);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [userImage, setUserImage] = useState(placeholder);
  const [modalVisible, setModalVisible] = useState(false);
  

    const customIcon = L.icon({
      iconUrl: `${url}/icons/location.png`,
      iconSize: [25, 30], 
      iconAnchor: [12, 41] 
    });

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
    setHasLiked(false);
    setHasVerified(false);
}, [userAuthEmail]);

  useEffect(() => {
    const userLikes = JSON.parse(post.Likes);
    const userVerifications = JSON.parse(post.Verifications);

    setHasLiked(userLikes.includes(userAuthEmail));
    setHasVerified(userVerifications.includes(userAuthEmail));

    setLikesCount(userLikes.length);
    setVerificationsCount(userVerifications.length);
    
    fetchUserImage();
  }, [fetchUserImage, post.Likes, post.Verifications, userAuthEmail]);



  const handleLike = async () =>{
    try {
      if (hasLiked) {
        const response = await axios.post(`${url}/api/posts/${post.Id}/unlike`, 
          { email: userAuthEmail },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });
        setLikesCount(likesCount - 1);
        setHasLiked(false);
      } else {
        const response = await axios.post(`${url}/api/posts/${post.Id}/like`, 
          { email: userAuthEmail },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });
        setLikesCount(likesCount + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error("Error al manejar el like:", error);
    }
  };

  const handleVerify = async () => {
    if(hasVerified) return;
    try {
      const response = await axios.post(`${url}/api/posts/${post.Id}/verify`, 
        { email: userAuthEmail },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
      setHasVerified(true);
      setVerificationsCount(verificationsCount + 1);
    } catch (error) {
      console.error("Error al verificar la publicación:", error);
    }
  };
  const isVerified  = () =>{
    console.log(verificationsCount);
    if(verificationsCount > 4){
      console.log(true);
      return true;
    }else{
      console.log(false);
      return false;
    }
  }

  return (
    <div className="post-container">
      <div className="header-post-container">
        <div className="user-post-container">
          <img className="user-post-image" src={userImage} alt="User" />
          <div className="user-info-post">
            <p className="user-name">{name}</p>
            <p className="post-time">{time}</p>
          </div>
        </div>
        {isVerified() && (
          <div className="verification-container">
            <p className="verification-description">Problema resuelto</p>
            <img className="verification-icon" src={`${url}/icons/verify.png`} alt="verification" />
          </div>
        )}
      </div>
      <p className="post-comment">{comment}</p>
      <div className="map-button-container">
        <div className="post-location-button" 
        onClick={() => setModalVisible(true)}>
          <span>Ubicación</span>
          <img className="location-icon" src={`${url}/icons/location.png`}/>
        </div>
      </div>
      
      {modalVisible && (
        <div className="modal">
          <div className="map-modal-content">
            <div className="close-button-container">
              <button className="close-button" onClick={() => setModalVisible(false)}>×</button>
            </div>
            <div className="map-container">
              <MapContainer center={[location.lat, location.lng]} zoom={25} style={{ height: "600px", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[location.lat, location.lng]} icon={customIcon}>
                  <Popup>Ubicación del post</Popup>
                </Marker>
              </MapContainer>
              <div className="create-post-modal-buttons-container">

              </div>
            </div>
          </div>
        </div>
      )}

      <img className="post-image" src={`${url}/uploads/${postImage}`} alt="Post" />
      <div className="buttons-post-container">
        <img src={hasLiked ? `${url}/icons/like.png`: `${url}/icons/nolike.png`} 
        alt="Like" className="like-button" 
        onClick={handleLike} />
        <label className="likes-count">{likesCount}{likesCount === 1 ? ' Like' : ' Likes'}</label>
        <button className="verify-button" onClick={handleVerify} style={hasVerified ? {fontWeight: 600} : {fontWeight: 500}}>{hasVerified ? '✓' : 'Verificar'}</button>
      </div>
    </div>
  );
}

export default Post;
