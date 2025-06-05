import React, { useState, useEffect } from "react";
import axios from 'axios';
import url from "./serveo";
import communityPlaceholder from '../images/community-placeholder.png';
import '../stylesheets/CreateCommunityModal.css'
import { departamentos } from '../States.js'

function CreateCommunityModal({onClose }) {
    const [profileImage, setProfileImage] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [selectedState, setSelectedState] = useState('GUA');
    const [selectedCity, setSelectedCity] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedCity('');
    };

    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 


        const formData = new FormData();
        formData.append('userEmail', userEmail);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('communityPicture', profileImage); // Cambiado aquí
        formData.append('state', selectedState);
        formData.append('city', selectedCity);

        try {
            const response = await axios.post(`${url}/api/create-community`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' 
                }
            });
            console.log('Community created:', response.data);
            setSuccessMessage('Comunidad creada con éxito!');
            setErrorMessage(''); // Resetea el mensaje de error
            onClose(); 
        } catch (error) {
            console.error('Error creating community:', error);
            setErrorMessage('Error al crear la comunidad. Inténtalo de nuevo.');
            setSuccessMessage(''); // Resetea el mensaje de éxito
        }
    };

    useEffect(() => {
        const userProfile = localStorage.getItem("userProfile");
        if (userProfile) {
            const userProfileObject = JSON.parse(userProfile);
            setUserEmail(userProfileObject.email);
        } else {
            console.error('No se encontró el perfil del usuario en el localStorage');
        }
    }, []);

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="close-button-container">
                    <button className="close-button" onClick={onClose}>×</button>
                </div>  
                <div className="modal-header">
                    <p className="modal-title">Crear una comunidad</p>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="profile-image-section">
                        <label htmlFor="profileImageRegister">
                            <div className="settings-user-image-container">
                                <img
                                    src={profileImagePreview || communityPlaceholder}
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
                    </div>
                    <div className="modal-body">
                        <label htmlFor="name">Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <label htmlFor="description">Descripción:</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <label htmlFor="country">Departamento:</label>
                        <select value={selectedState} onChange={handleStateChange}>
                            {Object.entries(departamentos).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.label}
                                </option>
                            ))}
                        </select>
                        {selectedState && (
                            <>
                                <label htmlFor="country">Municipio:</label>
                                <select value={selectedCity} onChange={handleCityChange}>
                                    {departamentos[selectedState].municipios.map((municipio) => (
                                        <option key={municipio.value} value={municipio.value}>
                                            {municipio.label}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="create-community-button">Crear Comunidad</button>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunityModal;
