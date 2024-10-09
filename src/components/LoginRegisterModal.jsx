
import React, { useState } from "react";
import axios from 'axios';
import '../stylesheets/LoginRegisterModal.css';
import url from "./serveo";

function LoginRegisterModal({ onClose, isLogin, onLoginSuccess, toggleMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [birthday, setBirthday] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBirthdayInvalid, setIsBirthdayInvalid] = useState(false);

  const handleFileChange = (event) => {
    setProfilePicture(event.target.files[0]);
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
    if (birthday) formData.append("birthday", birthday); 
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      if (isLogin) {
        const response = await axios.post(`${url}/api/login`, 
          { email, password },);
        onLoginSuccess({ email, profileImage: response.data.profileImage }); 
      } else {
        await axios.post(`${url}/api/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        onLoginSuccess({ email, profileImage: formData.get('profilePicture') }); 
      }
      onClose();
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
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
                <label htmlFor="name">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <label htmlFor="profilePicture">Imagen de Perfil:</label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
          <div className="modal-footer">
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
