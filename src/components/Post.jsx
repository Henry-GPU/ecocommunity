import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../stylesheets/Settings.css";
import placeholder from '../images/placeholder.png';
import { Link, useNavigate } from "react-router-dom";
import url from "./serveo";
function Profile({ isOpen, onClose, currentProfileImage, currentUsername, currentEmail, onUpdateProfile }) {
  const [username, setUsername] = useState(currentUsername);
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(currentProfileImage);
  const [profileImagePreview, setProfileImagePreview] = useState(currentProfileImage);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para almacenar el ID del usuario

  const navigate = useNavigate(); // Asegúrate de definir useNavigate

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchProfileImage = useCallback(async () => {
    try {
      const email = currentEmail;
      if (email) {
        const response = await axios.get(`${url}/api/get-profile-image`, {
          params: { email: email }
        });
        if (response.data.profileImage) {
          setProfileImagePreview(`${url}/uploads/${response.data.profileImage}`);
        } else {
          setProfileImagePreview(placeholder);
        }
      }
    } catch (error) {
      console.error('Error al obtener la imagen del perfil:', error);
      setProfileImage(placeholder);
    }
  }, [currentEmail]);

  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage]);

  const fetchUserId = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/get-user-id`, {
        params: { email: currentEmail }
      });
      return response.data.userId; // Devuelve el ID del usuario
    } catch (error) {
      console.error("Error al obtener el ID del usuario:", error);
      alert("No se pudo obtener el ID del usuario");
    }
  }, [currentEmail]);

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const userId = await fetchUserId(); // Obtener el userId directamente

    if (!userId) {
      alert("No se pudo obtener el ID del usuario. Asegúrate de que el correo electrónico sea correcto.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();

    if (profileImage) formData.append("profilePicture", profileImage);
    if (username) formData.append("name", username);
    if (email) formData.append("email", email);
    if (password) formData.append("password", password);

    try {
      await axios.put(`${url}/api/update-profile/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Perfil actualizado con éxito");
      navigate('/'); // Redirige después de actualizar
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      alert("Hubo un error al actualizar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h2>Ajustes de perfil</h2>

        <div className="profile-image-section">
          <label htmlFor="profileImage">
            <div className="settings-user-image-container">
              <img
                src={profileImagePreview || placeholder}
                alt="Profile Preview"
                className="profile-image-preview"
              />
              <img 
                src={`${url}/icons/edit.png`}
                alt="Edit image"
                className="edit-icon"
              />
            </div>
            
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="username-section">
          <label htmlFor="username">Nombre de usuario:</label>
          <input
            className="username-input"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="email-section">
          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="password-section">
          <label htmlFor="password">Nueva contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
          />
        </div>
        <div className="settings-note">
          <p>No es necesario llenar todos los campos, 
            solo rellena el que necesitas editar y guarda los cambios.
          </p>
        </div>

        <div className="settings-buttons">
          <button 
            className="submit-link-button" 
            onClick={handleSave} 
            disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
          <Link className="cancel-link-button" to="/">Cancelar</Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
