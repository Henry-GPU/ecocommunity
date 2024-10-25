import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../stylesheets/Post.css';
import axios from "axios";
import placeholder from '../images/placeholder.png';
import L, { Handler } from 'leaflet';
import url from './serveo';
import PostMenu from './PostMenu';

const axiosInstance = axios.create({
  baseURL: url
});

function Post({userRole, postCommunity, userEmail, name, time, comment, postImage, location, userAuthEmail, post }) {
  const [likesCount, setLikesCount] = useState();
  const [verificationsCount, setVerificationsCount] = useState();
  const [hasLiked, setHasLiked] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [userImage, setUserImage] = useState(placeholder);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPostMenuVisible, setPostMenuVisible] = useState(false);
  const [hasHidden, setHasHidden] = useState(false);
  const [hasDisabled, setHasDisabled] = useState(false);
  const [userAuthId, setUserAuthId] = useState(0);
  
  const toglePostMenu = () =>{
    if(isPostMenuVisible){
      setPostMenuVisible(false);
    }
    else{
      setPostMenuVisible(true);
    }
  }
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
    setPostMenuVisible(false);
    setHasLiked(false);
    setHasVerified(false);
  }, [userAuthEmail]);

  useEffect(() => {

    const fetchPostData = async () =>{
      try {
        const responseLike = await axiosInstance.get(`/api/check-like/${post.Id}`, 
          {params: {email: userAuthEmail}}
        );
        setHasLiked(responseLike.data.hasLiked);
        const responseVerification = await axiosInstance.get(`/api/check-verification/${post.Id}`, 
          {params: {email: userAuthEmail}}
        );
        setHasVerified(responseVerification.data.hasVerified);
      } catch (error) {
        
      }
    }

    
    
    fetchPostData();
    setLikesCount(post.likes);
    setVerificationsCount(post.verifications);
    fetchUserImage();
    fetchUserAuthId();
    setHasHidden(false);
    setHasDisabled(false);
  }, [fetchUserImage, userAuthEmail]);

  const fetchUserAuthId = async () => {

    try {
      const responseUserId = await axiosInstance.get('api/get-user-id', {
        params: {
          email: userAuthEmail
        }
      });
      const userId = responseUserId.data.userId;
      setUserAuthId(userId);
    } catch (error) {
      
    }
   
  };

  const handleLike = async () =>{
    try {
      if (hasLiked) {
        const response = await axios.post(`${url}/api/unlike/${post.Id}`, 
          { email: userAuthEmail },);
        setLikesCount(likesCount - 1);
        setHasLiked(false);
      } else {
        const response = await axios.post(`${url}/api/like/${post.Id}`, 
          { email: userAuthEmail },);
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
      const response = await axios.post(`${url}/api/verification/${post.Id}`, 
        { email: userAuthEmail },
        {
          headers: {
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
  };

  const toggleHidePost = async () => {
    const email = userAuthEmail;
    const postId = post.Id;
    const hide = !hasHidden;
    try {
      
        const response = await axios.post(`${url}/api/hide-post` , 
          {email, postId, hide});
          if (hide){
            setHasHidden(true);
          }
          else{
            setHasHidden(false);
          }   
    } 
    catch (error) {
    }
  };

  const toggleDisablePost = async () => {
    const disable = !hasDisabled;
    const id = post.Id;
    try {
      const response = await axios.put(`${url}/api/post-change-status` , 
        {id: id, status: !disable});
      if (disable){
        setHasDisabled(true);
      }
      else{
        setHasDisabled(false);
      }   
    } 
    catch (error) {
    }
  };

  return (
    <div className='post-container'>
    {(!hasHidden && !hasDisabled) && <div className="post-content">
      <div onClick={toglePostMenu} className="menu-post">⋯</div>
      {
        isPostMenuVisible &&
        <PostMenu
          setPostMenuVisible={setPostMenuVisible}
          userPostId={post.author.Id}
          userAuthId={userAuthId}
          userRole={userRole}
          hidePost={toggleHidePost}
          disablePost={toggleDisablePost}
        />
      }
      
      <div className="header-post-container">
        <div className="user-post-container">
          <img className="user-post-image" src={userImage} alt="User" />
          <div className="user-info-post">
            <div className="user-name">
              <p>{name}</p>
              <div className="user-emblems-container">
                  {(post.author.Role === 'Superusuario' || post.author.Role === 'Administrador') &&(
                    <div className="emblem">
                      <img src={`${url}/icons/admin-emblem.png`} className="user-emblem"/> 
                      <div className="emblem-name">{post.author.Role}</div>
                    </div>
                    )
                  }
              </div>
            </div>
            <div className='post-community'>{(postCommunity)&&<div><span>en </span>{postCommunity}</div>}</div>
            <p className="post-time">{time}</p>
          </div>
        </div>
      </div>
      <p className="post-comment">{comment}</p>
      <div className="map-button-container">
        <div className="post-location-button" 
        onClick={() => setModalVisible(true)}>
          <span>Ubicación</span>
          <img className="location-icon" src={`${url}/icons/location.png`}/>
        </div>  
        {isVerified() && (
          <div className="verification-container">
            <p className="verification-description">Problema resuelto</p>
            <img className="verification-icon" src={`${url}/icons/verify.png`} alt="verification" />
          </div>
        )}   
      </div>
       
      {modalVisible && (
        <div className="modal">
          <div className="map-modal-content">
            <div className="close-button-container">
              <button className="close-button" onClick={() => setModalVisible(false)}>×</button>
            </div>
            <div className="map-container">
              <MapContainer center={[location.lat, location.lng]} zoom={25} style={{ height: "500px", width: "100%" }}>
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
  }
  {hasHidden && 
    <div className='post-action-message-container'>
      <span className='post-action-message-title'>Ocultaste esta publicación</span>
      <img src={`${url}/icons/hide.svg`} className='post-action-message-icon'></img>
      <span className='post-action-message-description'>No volverás a ver esta publicación</span>
      <div className='post-action-message-button-container'>
        <button className='post-action-message-button' onClick={toggleHidePost} >Deshacer</button>
      </div>
    </div>}
    {hasDisabled && 
    <div className='post-action-message-container'>
      <span className='post-action-message-title'>Eliminaste esta publicación</span>
      <img src={`${url}/icons/hide.svg`} className='post-action-message-icon'></img>
      <span className='post-action-message-description'>La publicación fue eliminada y ya no será mostrada a otros usuarios.</span>
      <div className='post-action-message-button-container'>
        <button className='post-action-message-button' onClick={toggleDisablePost} >Deshacer</button>
      </div>
    </div>}
  </div>
  );
}

export default Post;
