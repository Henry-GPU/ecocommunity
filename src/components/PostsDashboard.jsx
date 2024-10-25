import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../stylesheets/PostsDashboard.css";
import placeholder from '../images/placeholder.png';
import { Link, useNavigate } from "react-router-dom";
import url from "./serveo";
import PostInfo from "./PostInfo";

function PostsDashboard({ isOpen, onClose, currentProfileImage, currentUsername, currentEmail, onUpdateProfile }) {
    const [posts, setPosts] = useState([]);
    const loadPosts = async () => {
        try {
          const response = await axios.get(`${url}/api/all-posts`);
          setPosts(response.data);
        } catch (error) {
          console.error('Error al cargar los posts:', error);
        }
      };

      useEffect(()=>{
        loadPosts();
      })
  return (
    <div className="admin-posts-dashboard-container">
         <div>
            {posts.map((post) => (
                <PostInfo
                    id = {post.Id}
                    postStatus={post.Is_Active}
                    post={post}
                    key={post.Id} 
                    userEmail={post.author.Email}
                    postCommunity={post.Community}
                    name={post.author.User_Name}
                    time={new Date(post.CreatedAt).toLocaleString(
                        "es-GT", {
                            timeZone: "UTC",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,

                    })}
                    comment={post.Comment}
                    postImage={post.image}
                    location={
                        typeof post.Location === "string"
                        ?   {
                            lat: parseFloat(post.Location.split(",")[0]),
                            lng: parseFloat(post.Location.split(",")[1]),
                            }
                        :   {
                            lat: post.Location.lat, 
                            lng: post.Location.lng
                            }
                    }
                    likesCount={post.likes}
                    verificationsCount={post.verifications}
                />
            ))}
        </div>   
    </div>
  );
}

export default PostsDashboard;
