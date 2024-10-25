
import React, { useState } from "react";
import axios from 'axios';
import '../stylesheets/LoginRegisterModal.css';
import url from "./serveo";
import placeholder from '../images/placeholder.png';

function LoginRegisterModal({ onClose, isLogin, onLoginSuccess, toggleMode}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(placeholder);
  const [birthday, setBirthday] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBirthdayInvalid, setIsBirthdayInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState('');

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const today = new Date();
    const birthDate = new Date(birthday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const isMinor = age < 10 || (age === 10 && monthDifference < 0) || (age === 10 && monthDifference === 0 && today.getDate() < birthDate.getDate());

    if (isMinor) {
      setIsBirthdayInvalid(true);
      setIsSubmitting(false);
      return;
    } else {
      setIsBirthdayInvalid(false);
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (name) formData.append("name", name);
    if (username) formData.append("username", username);
    if (birthday) formData.append("birthday", birthday); 
    if (profileImage) formData.append("profilePicture", profileImage);

    try {
      if (isLogin) {
        const response = await axios.post(`${url}/api/login`, 
          { email, password },);
          const role = response.data.role;
          const status = response.data.status;
          if(status === false){
            setErrorMessage('Tu cuenta ha sido desactivada');
          }else{
            setErrorMessage('');
            onLoginSuccess({ email, role, status});
          }
      } else {
        formData.append('role', 6);
        await axios.post(`${url}/api/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        onLoginSuccess({ email, role: 6, status: true}); 
        onClose();
      }
      
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setErrorMessage('Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="close-button-container">
          <button className="close-button" onClick={onClose}>×</button>
        </div>       
        <div className="modal-header">
          <h2 className="modal-title">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2> 
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
        {!isLogin && <div className="profile-image-section">
                  <label htmlFor="profileImageRegister">
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
                id="profileImageRegister"
                accept="image/*"
                onChange={handleProfileImageChange}
                style={{ display: "none" }}
              />
          </div>}
        
          <div className="modal-body">
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isLogin && (
              <>
                <label htmlFor="name">Nombre Completo:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <label htmlFor="name">Nombre de Usuario:</label>
                <input
                  type="text"
                  id="name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <label htmlFor="birthday">Fecha de Nacimiento:</label>
                <input
                className="birthday-input"
                  type="date"
                  id="birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
                {isBirthdayInvalid && <p className="error-message">Debes tener al menos 10 años para registrarte.</p>}
                
              </>
            )}
          </div>
          <div className="modal-footer">
            {errorMessage && <p className="login-register-modal-errorMessage">{errorMessage}</p>}
            <button className="login-modal-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
            <button className="toggle-button pointer" type="button" onClick={toggleMode}>
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginRegisterModal;
