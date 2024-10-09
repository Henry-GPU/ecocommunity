import React, { useState, useEffect, useCallback } from "react";
import "../stylesheets/CreatePost.css"
import axios from "axios";
import placeholder from '../images/placeholder.png';
import url from "./serveo";

const axiosInstance = axios.create({
    baseURL: url,
});

function CreatePost ({isAuthenticated, openCreatePostModal, userProfile}){
    const [profileImage, setProfileImage] = useState(placeholder);

    const fetchProfileImage = useCallback(async () => {
        try {
          const email = userProfile?.email;
          if (email) {
            const response = await axiosInstance.get('/api/get-profile-image', {
              params: { email: email }});
            if (response.data.profileImage) {
              setProfileImage(`${url}/uploads/${response.data.profileImage}`);
            } else {
              setProfileImage(placeholder);
            }
          }
        } catch (error) {
          console.error('Error al obtener la imagen del perfil:', error);
          setProfileImage(placeholder);
        }
      }, [userProfile?.email]);
    
      useEffect(() => {
        if (isAuthenticated) {
          fetchProfileImage();
        }
      }, [isAuthenticated, fetchProfileImage]);

    console.log(isAuthenticated ? 'true': 'false');

    return ( 
    <div className="create-post-container" 
    
    style={isAuthenticated ? {display: 'flex'} : {display: 'none'}}>
        <div className="create-post-user-image-container">
            <img className="pointer"src={profileImage} alt="user"></img>
        </div>
        <div className="create-post-button-container">
            <div className="create-post-button pointer" onClick={openCreatePostModal}>
                <span>Escribe una publicación..</span>
            </div>
        </div>
        
    </div>
    );
}

export default CreatePost;
