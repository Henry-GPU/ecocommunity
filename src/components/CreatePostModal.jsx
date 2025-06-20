import React, { useState, useRef } from "react";
import axios from "axios";
import "../stylesheets/CreatePostModal.css";
import url from "./serveo";

function CreatePostModal({ onClose, userName, userEmail, refreshPosts, userCommunities }) {
    const [postImage, setPostImage] = useState(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const textareaRef = useRef(null);
    const [community, setCommunity] = useState('');

    const handleFileChange = (event) => {
        const image = event.target.files[0];
        if (image) {
            setPostImage(image);
            setImagePreview(URL.createObjectURL(image)); 
        } else {
            setPostImage(null);
            setImagePreview("");
        }
    };
    console.log(userCommunities)
    const handleCommunityChange = (e) => {
        setCommunity(e.target.value);
    };

    const handleGeolocation = () => {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude                       
                        };
                        console.log(location.longitude);
                        console.log(location.latitude);
                        resolve(`${location.latitude},${location.longitude}`);
                    },
                    (error) => {
                        console.error("Error al obtener la ubicación: ", error);
                        reject("No se pudo obtener la ubicación.");
                    }
                );
            } else {
                reject("La geolocalización no está soportada por este navegador.");
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const location = await handleGeolocation();
            
            const formData = new FormData();
            formData.append("email", userEmail);
            formData.append("name", userName);
            formData.append("postImage", postImage);
            formData.append("community", community);
            formData.append("comment", comment);
            formData.append("location", location);
            
            await axios.post(`${url}/api/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            refreshPosts();
            onClose();
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            alert(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTextareaChange = (event) => {
        setComment(event.target.value);
        adjustTextareaHeight(); 
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "50px"; 
            textarea.style.height = `${textarea.scrollHeight * 1}px`; 
        }
    };

    return (
        <div className="modal">
            <div className="create-post-modal-container">
                <div className="close-button-container">
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form className="create-post-modal-form" onSubmit={handleSubmit}>
                    <div className="create-post-modal-comment-container">
                        <textarea
                            ref={textareaRef}
                            className="create-post-modal-comment"
                            id="post-comment"
                            value={comment}
                            onChange={handleTextareaChange}
                            placeholder="Escribe una publicación..."
                        />
                    </div>
                    <div className="create-post-modal-buttons-container">
                        <button
                            type="button"
                            onClick={() => document.getElementById("postImage").click()}
                        >Foto </button>
                        <input
                            type="file"
                            id="postImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>
                    <div className="create-post-modal-image-preview-container">
                        {imagePreview && <img 
                            className="create-post-modal-image-preview" 
                            src={imagePreview} 
                            alt="vista previa" 
                        />}
                    </div>
                    <button className="post-modal-button" type="submit" disabled={isSubmitting}>Publicar</button>
                    <select
                        value={community}
                        onChange={handleCommunityChange}>
                            <option value={0}>
                                   Público
                            </option>
                            {Object.entries(userCommunities).map(([key, community]) => (
                                <option key={community.Id} value={community.Id}>
                                    {community.Name}
                                </option>
                            ))}
                    </select>
                </form>        
            </div>
        </div>
    );
}

export default CreatePostModal;
