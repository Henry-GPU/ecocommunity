import React, { useState } from 'react';

function LocationPicker({ onLocationSelected, onClose }) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = { latitude, longitude };
                    setLocation(location);
                    onLocationSelected(location);
                },
                (error) => {
                    setError('No se pudo obtener la ubicación. Asegúrate de que los permisos de geolocalización están habilitados.');
                }
            );
        } else {
            setError('La geolocalización no está soportada en este navegador.');
        }
    };

    return (
        <div className="location-picker">
            <button onClick={handleGetLocation}>Obtener Ubicación</button>
            {location && (
                <div className="location-info">
                    <h3>Ubicación Seleccionada</h3>
                    <p>Latitud: {location.latitude}</p>
                    <p>Longitud: {location.longitude}</p>
                </div>
            )}
            {error && <p className="error">{error}</p>}
            <button onClick={onClose}>Cerrar</button>
        </div>
    );
}

export default LocationPicker;
